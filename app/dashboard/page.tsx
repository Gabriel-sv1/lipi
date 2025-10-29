import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';

export const metadata = {
  title: 'Dashboard',
  description: 'Your workspaces',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('workspace_owner_id', user.id)
    .eq('in_trash', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!workspace) {
    redirect('/dashboard/new-workspace');
  }

  redirect(`/dashboard/${workspace.id}`);
}
