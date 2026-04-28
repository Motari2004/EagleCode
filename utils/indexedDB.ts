// utils/indexedDB.ts

const DB_NAME = "ScorpioProjectsDB";
const DB_VERSION = 1;
const STORE_NAME = "project_files";

export interface StoredProject {
  id: string;
  name: string;
  prompt: string;
  files: Record<string, any>;
  preview_html: string;
  timestamp: string;
  project_type: string;
  file_count: number;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db && this.db.name === DB_NAME) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("✅ IndexedDB opened successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Create object store with project ID as key
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
          store.createIndex("name", "name");
          console.log("✅ IndexedDB store created");
        }
      };
    });
  }

  async saveProject(project: StoredProject): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(project);
      
      request.onsuccess = () => {
        console.log(`✅ Project "${project.name}" saved to IndexedDB (${Object.keys(project.files).length} files)`);
        resolve();
      };
      
      request.onerror = () => {
        console.error("Failed to save project:", request.error);
        reject(request.error);
      };
    });
  }

  async getAllProjects(): Promise<StoredProject[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      const request = index.getAll();
      
      request.onsuccess = () => {
        // Sort by timestamp (newest first)
        const projects = request.result.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        console.log(`📚 Loaded ${projects.length} projects from IndexedDB`);
        resolve(projects);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getProject(id: string): Promise<StoredProject | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log(`🗑️ Deleted project ${id} from IndexedDB`);
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearAllProjects(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log("🗑️ Cleared all projects from IndexedDB");
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export const indexedDBService = new IndexedDBService();