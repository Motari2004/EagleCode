// lib/indexedDB.ts

interface ProjectData {
  id: string;
  name: string;
  prompt: string;
  files: Record<string, string>;
  previewHtml: string;
  timestamp: number;
  projectType: string;
  fileCount: number;
}

class ProjectDatabase {
  private dbName = "ScorpioProjects";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db && this.db.version === this.dbVersion) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create projects store
        if (!db.objectStoreNames.contains("projects")) {
          const store = db.createObjectStore("projects", { keyPath: "id" });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("name", "name", { unique: false });
          store.createIndex("projectType", "projectType", { unique: false });
        }
        
        // Create files store (for large file storage)
        if (!db.objectStoreNames.contains("files")) {
          const fileStore = db.createObjectStore("files", { keyPath: "id" });
          fileStore.createIndex("projectId", "projectId", { unique: false });
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      };
    });
  }

  async saveProject(project: ProjectData): Promise<string> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["projects"], "readwrite");
      const store = transaction.objectStore("projects");
      
      const request = store.put({
        ...project,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve(project.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getProject(id: string): Promise<ProjectData | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["projects"], "readonly");
      const store = transaction.objectStore("projects");
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProjects(limit: number = 50): Promise<ProjectData[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["projects"], "readonly");
      const store = transaction.objectStore("projects");
      const index = store.index("timestamp");
      const projects: ProjectData[] = [];
      
      // Get projects sorted by timestamp (newest first)
      const request = index.openCursor(null, "prev");
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && projects.length < limit) {
          projects.push(cursor.value);
          cursor.continue();
        } else {
          resolve(projects);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["projects"], "readwrite");
      const store = transaction.objectStore("projects");
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAllProjects(): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["projects"], "readwrite");
      const store = transaction.objectStore("projects");
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageInfo(): Promise<{ used: number; limit: number; percentUsed: number }> {
    // Estimate storage usage (not exact, but gives idea)
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["projects"], "readonly");
      const store = transaction.objectStore("projects");
      const request = store.getAll();
      
      request.onsuccess = () => {
        const projects = request.result;
        let totalSize = 0;
        
        for (const project of projects) {
          totalSize += JSON.stringify(project).length;
        }
        
        // IndexedDB typically allows 50MB-2GB depending on browser
        const estimatedLimit = 50 * 1024 * 1024; // Assume 50MB limit
        const percentUsed = (totalSize / estimatedLimit) * 100;
        
        resolve({
          used: totalSize,
          limit: estimatedLimit,
          percentUsed: Math.min(percentUsed, 100)
        });
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async exportProjects(): Promise<string> {
    const projects = await this.getAllProjects(100);
    return JSON.stringify(projects, null, 2);
  }

  async importProjects(jsonData: string): Promise<number> {
    const projects = JSON.parse(jsonData) as ProjectData[];
    let count = 0;
    
    for (const project of projects) {
      await this.saveProject(project);
      count++;
    }
    
    return count;
  }
}

// Singleton instance
export const projectDB = new ProjectDatabase();