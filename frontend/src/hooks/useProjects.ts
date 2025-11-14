import { useState, useEffect, useCallback } from 'react';
import { Project, ApiResponse, LoadingState, PaginationInfo } from '../types';
import { getAuthToken } from '../lib/utils';

interface ProjectsState extends LoadingState {
  projects: Project[];
  pagination?: PaginationInfo;
}

interface UseProjectsOptions {
  page?: number;
  limit?: number;
  organizationId?: string;
  status?: string;
  energySource?: string;
  autoLoad?: boolean;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const {
    page = 1,
    limit = 10,
    organizationId,
    status,
    energySource,
    autoLoad = true
  } = options;

  const [state, setState] = useState<ProjectsState>({
    projects: [],
    isLoading: true,
    error: undefined,
    lastUpdated: undefined,
    pagination: undefined
  });

  const fetchProjects = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Authentication required'
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (organizationId) params.append('organizationId', organizationId);
      if (status) params.append('status', status);
      if (energySource) params.append('energySource', energySource);

      const response = await fetch(`http://localhost:3001/api/projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data: ApiResponse<Project[]> = await response.json();
        setState({
          projects: data.data,
          isLoading: false,
          error: undefined,
          lastUpdated: new Date(),
          pagination: data.pagination
        });
      } else {
        const errorData = await response.json();
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorData.error || 'Failed to fetch projects'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Connection error'
      }));
    }
  }, [page, limit, organizationId, status, energySource]);

  useEffect(() => {
    if (autoLoad) {
      fetchProjects();
    }
  }, [fetchProjects, autoLoad]);

  return {
    ...state,
    refetch: fetchProjects,
    refresh: fetchProjects
  };
}

export function useProject(projectId: string) {
  const [state, setState] = useState<{
    project: Project | null;
    isLoading: boolean;
    error?: string;
  }>({
    project: null,
    isLoading: true,
    error: undefined
  });

  const fetchProject = useCallback(async () => {
    if (!projectId) return;

    const token = getAuthToken();
    if (!token) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Authentication required'
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data: ApiResponse<Project> = await response.json();
        setState({
          project: data.data,
          isLoading: false,
          error: undefined
        });
      } else {
        const errorData = await response.json();
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorData.error || 'Failed to fetch project'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Connection error'
      }));
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    ...state,
    refetch: fetchProject
  };
}

export function useCreateProject() {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: undefined
  });

  const createProject = async (projectData: Partial<Project>) => {
    const token = getAuthToken();
    if (!token) {
      setState({ isLoading: false, error: 'Authentication required' });
      return { success: false, error: 'Authentication required' };
    }

    setState({ isLoading: true, error: undefined });

    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(projectData),
      });

      const data: ApiResponse<Project> = await response.json();

      if (response.ok && data.success) {
        setState({ isLoading: false, error: undefined });
        return { success: true, data: data.data };
      } else {
        setState({ isLoading: false, error: data.error || 'Failed to create project' });
        return { success: false, error: data.error || 'Failed to create project' };
      }
    } catch (error) {
      const errorMessage = 'Connection error';
      setState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    createProject
  };
}

export function useUpdateProject() {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: undefined
  });

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    const token = getAuthToken();
    if (!token) {
      setState({ isLoading: false, error: 'Authentication required' });
      return { success: false, error: 'Authentication required' };
    }

    setState({ isLoading: true, error: undefined });

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const data: ApiResponse<Project> = await response.json();

      if (response.ok && data.success) {
        setState({ isLoading: false, error: undefined });
        return { success: true, data: data.data };
      } else {
        setState({ isLoading: false, error: data.error || 'Failed to update project' });
        return { success: false, error: data.error || 'Failed to update project' };
      }
    } catch (error) {
      const errorMessage = 'Connection error';
      setState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    updateProject
  };
}
