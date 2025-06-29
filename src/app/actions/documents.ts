
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getActiveWorkspace, logAuditEvent } from './workspace';
import type { TablesInsert } from '@/lib/supabase/database.types';

// Helper function to dynamically import and use pdf-parse
async function getPdfContent(fileBuffer: Buffer): Promise<string> {
  const pdf = (await import('pdf-parse')).default;
  const data = await pdf(fileBuffer);
  return data.text;
}

export async function processDocument(
  fileName: string,
  storagePath: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to upload a document.');
  }

  // Check against workspace limits
  const workspace = await getActiveWorkspace();
  const { count: docCount, error: countError } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id); // In a team scenario, this might check against the workspace
  
  if (countError) throw new Error('Could not count existing documents.');
  
  if (docCount >= workspace.max_documents) {
    await logAuditEvent('document.upload.failed', { reason: 'limit_exceeded', fileName });
    throw new Error(`Document limit of ${workspace.max_documents} reached. Please upgrade your plan.`);
  }

  // Download the file from storage to parse it
  const { data: blob, error: downloadError } = await supabase.storage
    .from('documents')
    .download(storagePath);

  if (downloadError) {
    throw new Error('Failed to download document for processing.');
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const content = await getPdfContent(buffer);
  const fileSize = blob.size;

  // Insert document metadata and content into the database
  const docToInsert: TablesInsert<'documents'> = {
    name: fileName,
    user_id: user.id,
    storage_path: storagePath,
    content: content,
    file_size: fileSize,
  };

  const { data: document, error: insertError } = await supabase
    .from('documents')
    .insert(docToInsert)
    .select()
    .single();

  if (insertError) {
    // If insert fails, clean up the stored file
    await supabase.storage.from('documents').remove([storagePath]);
    await logAuditEvent('document.upload.failed', { reason: 'db_insert_failed', fileName });
    throw new Error('Failed to save document metadata to database.');
  }

  await logAuditEvent('document.upload.success', { documentId: document.id, fileName });
  revalidatePath('/app');
  revalidatePath('/app/uploads');
  return document;
}

export async function getDocuments() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
    return data || [];
}

export async function deleteDocument(prevState: any, formData: FormData) {
    const documentId = formData.get('documentId') as string;
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
        return { error: 'You must be logged in to delete a document.' };
    }

    // First, get the document to find its storage path
    const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path, name')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !doc) {
        return { error: 'Document not found or you do not have permission to delete it.' };
    }
    
    const docName = doc.name;

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.storage_path]);

    if (storageError) {
        // Log the error but don't block the DB deletion
        console.error("Storage deletion failed, but proceeding to delete from DB", storageError);
    }

    // Delete from database (cascading delete will handle messages)
    const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
    
    if (dbError) {
        await logAuditEvent('document.delete.failed', { documentId, fileName: docName, error: dbError.message });
        return { error: 'Failed to delete document from database.' };
    }

    await logAuditEvent('document.delete.success', { documentId, fileName: docName });
    revalidatePath('/app');
    revalidatePath('/app/uploads');
    revalidatePath('/app/super-admin/documents');
    return { success: `Document "${docName}" deleted successfully.` };
}
