import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getRecentWorkspace } from '@/lib/db/queries';

export const metadata = {
  title: 'Dashboard',
  description: 'Your workspaces',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const workspace = await getRecentWorkspace(user.id);

  if (!workspace) {
    redirect('/dashboard/new-workspace');
  }

  redirect(`/dashboard/${workspace.id}`);
}
