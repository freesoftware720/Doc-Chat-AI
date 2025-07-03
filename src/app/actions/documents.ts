
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TablesInsert } from '@/lib/supabase/database.types';

// Helper function to dynamically import and use pdf-parse
async function getPdfContent(fileBuffer: Buffer): Promise<string> {
  const pdf = (await import('pdf-parse')).default;
  const data = await pdf(fileBuffer);
  return data.text;
}

async function getFileContent(fileBuffer: Buffer, fileType: string): Promise<string> {
    if (fileType === 'application/pdf') {
        const pdf = (await import('pdf-parse')).default;
        const data = await pdf(fileBuffer);
        return data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const mammoth = (await import('mammoth')).default;
        const data = await mammoth.extractRawText({ buffer: fileBuffer });
        return data.value;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const xlsx = (await import('xlsx')).default;
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_csv(sheet);
    } else if (fileType === 'text/plain') {
        return fileBuffer.toString('utf-8');
    }
    return 'Unsupported file type';
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

  // Download the file from storage to parse it
  const { data: blob, error: downloadError } = await supabase.storage
    .from('documents')
    .download(storagePath);

  if (downloadError) {
    throw new Error('Failed to download document for processing.');
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const content = await getFileContent(buffer, blob.type);
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
    console.error("Error saving document metadata:", insertError.message);
    throw new Error('Failed to save document metadata to database.');
  }

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
        return { error: 'Failed to delete document from database.' };
    }

    revalidatePath('/app');
    revalidatePath('/app/uploads');
    revalidatePath('/app/super-admin/documents');
    return { success: `Document "${docName}" deleted successfully.` };
}
