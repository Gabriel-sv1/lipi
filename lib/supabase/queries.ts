import { supabase } from './client';

export async function getUserWorkspaces(userId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .or(`workspace_owner_id.eq.${userId},id.in.(select workspace_id from collaborators where user_id=${userId})`)
    .eq('in_trash', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }

  return data;
}

export async function getWorkspaceById(workspaceId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching workspace:', error);
    return null;
  }

  return data;
}

export async function createWorkspace(workspace: {
  title: string;
  iconId: string;
  workspaceOwnerId: string;
  data?: string;
  logo?: string;
}) {
  const { data, error } = await supabase
    .from('workspaces')
    .insert([
      {
        title: workspace.title,
        icon_id: workspace.iconId,
        workspace_owner_id: workspace.workspaceOwnerId,
        data: workspace.data,
        logo: workspace.logo,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }

  return data;
}

export async function updateWorkspace(
  workspaceId: string,
  updates: {
    title?: string;
    iconId?: string;
    data?: string;
    logo?: string;
    bannerUrl?: string;
    inTrash?: boolean;
  }
) {
  const updateData: Record<string, unknown> = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.iconId !== undefined) updateData.icon_id = updates.iconId;
  if (updates.data !== undefined) updateData.data = updates.data;
  if (updates.logo !== undefined) updateData.logo = updates.logo;
  if (updates.bannerUrl !== undefined) updateData.banner_url = updates.bannerUrl;
  if (updates.inTrash !== undefined) updateData.in_trash = updates.inTrash;

  const { data, error } = await supabase
    .from('workspaces')
    .update(updateData)
    .eq('id', workspaceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }

  return data;
}

export async function deleteWorkspace(workspaceId: string) {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId);

  if (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
}

export async function getWorkspaceFolders(workspaceId: string) {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('in_trash', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }

  return data;
}

export async function createFolder(folder: {
  title: string;
  iconId: string;
  workspaceId: string;
  data?: string;
}) {
  const { data, error } = await supabase
    .from('folders')
    .insert([
      {
        title: folder.title,
        icon_id: folder.iconId,
        workspace_id: folder.workspaceId,
        data: folder.data,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating folder:', error);
    throw error;
  }

  return data;
}

export async function updateFolder(
  folderId: string,
  updates: {
    title?: string;
    iconId?: string;
    data?: string;
    bannerUrl?: string;
    inTrash?: boolean;
  }
) {
  const updateData: Record<string, unknown> = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.iconId !== undefined) updateData.icon_id = updates.iconId;
  if (updates.data !== undefined) updateData.data = updates.data;
  if (updates.bannerUrl !== undefined) updateData.banner_url = updates.bannerUrl;
  if (updates.inTrash !== undefined) updateData.in_trash = updates.inTrash;

  const { data, error } = await supabase
    .from('folders')
    .update(updateData)
    .eq('id', folderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating folder:', error);
    throw error;
  }

  return data;
}

export async function deleteFolder(folderId: string) {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
}

export async function getFolderFiles(folderId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('folder_id', folderId)
    .eq('in_trash', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching files:', error);
    return [];
  }

  return data;
}

export async function getWorkspaceFiles(workspaceId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('folder_id', null)
    .eq('in_trash', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching workspace files:', error);
    return [];
  }

  return data;
}

export async function getFileById(fileId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching file:', error);
    return null;
  }

  return data;
}

export async function createFile(file: {
  title: string;
  iconId: string;
  workspaceId: string;
  folderId?: string;
  data?: string;
}) {
  const { data, error } = await supabase
    .from('files')
    .insert([
      {
        title: file.title,
        icon_id: file.iconId,
        workspace_id: file.workspaceId,
        folder_id: file.folderId || null,
        data: file.data,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating file:', error);
    throw error;
  }

  return data;
}

export async function updateFile(
  fileId: string,
  updates: {
    title?: string;
    iconId?: string;
    data?: string;
    bannerUrl?: string;
    inTrash?: boolean;
  }
) {
  const updateData: Record<string, unknown> = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.iconId !== undefined) updateData.icon_id = updates.iconId;
  if (updates.data !== undefined) updateData.data = updates.data;
  if (updates.bannerUrl !== undefined) updateData.banner_url = updates.bannerUrl;
  if (updates.inTrash !== undefined) updateData.in_trash = updates.inTrash;

  const { data, error } = await supabase
    .from('files')
    .update(updateData)
    .eq('id', fileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating file:', error);
    throw error;
  }

  return data;
}

export async function deleteFile(fileId: string) {
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getWorkspaceCollaborators(workspaceId: string) {
  const { data, error } = await supabase
    .from('collaborators')
    .select('*, user(*)')
    .eq('workspace_id', workspaceId);

  if (error) {
    console.error('Error fetching collaborators:', error);
    return [];
  }

  return data;
}

export async function addCollaborator(workspaceId: string, userId: string) {
  const { data, error } = await supabase
    .from('collaborators')
    .insert([
      {
        workspace_id: workspaceId,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding collaborator:', error);
    throw error;
  }

  return data;
}

export async function removeCollaborator(workspaceId: string, userId: string) {
  const { error } = await supabase
    .from('collaborators')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing collaborator:', error);
    throw error;
  }
}
