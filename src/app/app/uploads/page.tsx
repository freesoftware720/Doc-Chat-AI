
import { getDocuments } from '@/app/actions/documents';
import { UploadsClientPage } from './uploads-client-page';


export default async function UploadsPage() {
    const documents = await getDocuments();

    return <UploadsClientPage documents={documents} />;
  }
