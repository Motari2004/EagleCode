// hooks/useIndexedDB.ts
import { useState, useEffect, useCallback } from 'react';
import { projectDB, ProjectData } from '@/lib/indexedDB';

export function useIndexedDB() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 0, percentUsed: 0 });

  // Load all projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const allProjects = await projectDB.getAllProjects();
      setProjects(allProjects);
      const info = await projectDB.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = useCallback(async (project: Omit<ProjectData, 'timestamp'>) => {
    try {
      const id = await projectDB.saveProject({
        ...project,
        timestamp: Date.now()
      });
      await loadProjects(); // Refresh list
      return id;
    } catch (error) {
      console.error("Failed to save project:", error);
      throw error;
    }
  }, []);

  const getProject = useCallback(async (id: string) => {
    try {
      return await projectDB.getProject(id);
    } catch (error) {
      console.error("Failed to get project:", error);
      return null;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectDB.deleteProject(id);
      await loadProjects(); // Refresh list
      return true;
    } catch (error) {
      console.error("Failed to delete project:", error);
      return false;
    }
  }, []);

  const deleteAllProjects = useCallback(async () => {
    try {
      await projectDB.deleteAllProjects();
      await loadProjects();
      return true;
    } catch (error) {
      console.error("Failed to delete all projects:", error);
      return false;
    }
  }, []);

  const getStorageInfo = useCallback(async () => {
    return await projectDB.getStorageInfo();
  }, []);

  const exportProjects = useCallback(async () => {
    return await projectDB.exportProjects();
  }, []);

  const importProjects = useCallback(async (jsonData: string) => {
    const count = await projectDB.importProjects(jsonData);
    await loadProjects();
    return count;
  }, []);

  return {
    isLoading,
    projects,
    storageInfo,
    saveProject,
    getProject,
    deleteProject,
    deleteAllProjects,
    getStorageInfo,
    exportProjects,
    importProjects,
    refreshProjects: loadProjects
  };
}