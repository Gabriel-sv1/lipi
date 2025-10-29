import { redirect } from 'next/navigation';
import { getFileById } from '@/lib/supabase/queries';
import { FileEditor } from './components/file-editor';

type FilePageProps = {
  params: Promise<{ workspaceId: string; fileId: string }>;
};

export default async function FilePage({ params }: FilePageProps) {
  const { fileId } = await params;

  if (!fileId) {
    redirect('/dashboard');
  }

  try {
    const file = await getFileById(fileId);

    if (!file) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">File not found</h2>
            <p className="mt-2 text-muted-foreground">
              The file you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
          </div>
        </div>
      );
    }

    return <FileEditor file={file} />;
  } catch (err) {
    console.error('Error loading file:', err);
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error loading file</h2>
          <p className="mt-2 text-muted-foreground">
            There was an error loading this file. Please try again.
          </p>
        </div>
      </div>
    );
  }
}
