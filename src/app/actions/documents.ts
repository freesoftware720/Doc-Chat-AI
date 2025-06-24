'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

  const pdf = (await import('pdf-parse')).default;
  const buffer = Buffer.from(await blob.arrayBuffer());
  const pdfData = await pdf(buffer);
  const content = pdfData.text;

  // Insert document metadata and content into the database
  const { data: document, error: insertError } = await supabase
    .from('documents')
    .insert({
      name: fileName,
      user_id: user.id,
      storage_path: storagePath,
      content: content,
    })
    .select()
    .single();

  if (insertError) {
    // If insert fails, clean up the stored file
    await supabase.storage.from('documents').remove([storagePath]);
    throw new Error('Failed to save document metadata to database.');
  }

  revalidatePath('/app');
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

export async function deleteDocument(documentId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
        throw new Error('You must be logged in to delete a document.');
    }

    // First, get the document to find its storage path
    const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !doc) {
        throw new Error('Document not found or you do not have permission to delete it.');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.storage_path]);

    if (storageError) {
        // Log the error but don't block the DB deletion
        console.error("Storage deletion failed, but proceeding to delete from DB", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
    
    if (dbError) {
        throw new Error('Failed to delete document from database.');
    }

    revalidatePath('/app');
}
