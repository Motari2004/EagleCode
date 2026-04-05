// components/DatabaseModal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Database, 
  Loader2, 
  Check, 
  AlertCircle,
  Server,
  Key,
  Globe,
  Shield
} from "lucide-react";
import { toast } from "sonner";

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, string>;
  projectName: string;
  onDatabaseConfigured: (updatedFiles: Record<string, string>) => void;
}

type DatabaseType = "postgresql" | "mongodb" | "mysql" | "sqlite" | "supabase";

const databaseOptions = [
  {
    id: "postgresql" as DatabaseType,
    name: "PostgreSQL",
    icon: "🐘",
    description: "Powerful, open-source relational database",
    popular: true,
    requiresUrl: true,
    envVars: ["DATABASE_URL", "DATABASE_USER", "DATABASE_PASSWORD", "DATABASE_NAME"]
  },
  {
    id: "mongodb" as DatabaseType,
    name: "MongoDB",
    icon: "🍃",
    description: "NoSQL document database for modern apps",
    requiresUrl: true,
    envVars: ["MONGODB_URI", "MONGODB_DB"]
  },
  {
    id: "mysql" as DatabaseType,
    name: "MySQL",
    icon: "🐬",
    description: "Popular relational database",
    requiresUrl: true,
    envVars: ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"]
  },
  {
    id: "sqlite" as DatabaseType,
    name: "SQLite",
    icon: "📁",
    description: "Lightweight file-based database",
    requiresUrl: false,
    envVars: ["SQLITE_PATH"]
  },
  {
    id: "supabase" as DatabaseType,
    name: "Supabase",
    icon: "🔥",
    description: "PostgreSQL with real-time & auth",
    popular: true,
    requiresUrl: true,
    envVars: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]
  }
];

export function DatabaseModal({ 
  isOpen, 
  onClose, 
  files, 
  projectName,
  onDatabaseConfigured 
}: DatabaseModalProps) {
  const [selectedDb, setSelectedDb] = useState<DatabaseType>("postgresql");
  const [connectionString, setConnectionString] = useState("");
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [step, setStep] = useState<"select" | "configure" | "complete">("select");
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});

  const currentDbConfig = databaseOptions.find(d => d.id === selectedDb);

  const handleDbSelect = (dbId: DatabaseType) => {
    setSelectedDb(dbId);
    const config = databaseOptions.find(d => d.id === dbId);
    const initialEnvVars: Record<string, string> = {};
    config?.envVars.forEach(varName => {
      initialEnvVars[varName] = "";
    });
    setEnvVars(initialEnvVars);
    setStep("configure");
  };

  const handleConfigureDatabase = async () => {
    setIsConfiguring(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/configure-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files,
          projectName: projectName,
          databaseType: selectedDb,
          connectionString: connectionString,
          envVars: envVars
        })
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedFiles(result.updated_files);
        
        // Show success with generated files
        toast.success(`✅ Database configured for ${currentDbConfig?.name}!`);
        
        // Display the generated files
        setStep("complete");
        
        // Callback with updated files
        onDatabaseConfigured(result.updated_files);
      } else {
        toast.error(`Failed to configure database: ${result.error}`);
      }
    } catch (error) {
      console.error("Database configuration error:", error);
      toast.error("Failed to configure database");
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleEnvVarChange = (key: string, value: string) => {
    setEnvVars(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 to-purple-950 rounded-2xl border border-purple-500/30 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25">
                <Database size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Database Integration</h2>
                <p className="text-sm text-purple-300">AI-powered database setup for your project</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
          {step === "select" && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Choose a database for your project. The AI will automatically generate:
              </p>
              <ul className="text-xs text-gray-400 space-y-1 ml-4 list-disc">
                <li>Database connection utilities</li>
                <li>Schema definitions</li>
                <li>API routes for CRUD operations</li>
                <li>Environment configuration files</li>
                <li>ORM/ODM setup (Prisma, Mongoose, etc.)</li>
              </ul>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {databaseOptions.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => handleDbSelect(db.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left group ${
                      selectedDb === db.id
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                        : "border-white/10 hover:border-purple-500/50 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-3xl mb-2">{db.icon}</div>
                        <div className="font-semibold text-white">{db.name}</div>
                        <p className="text-xs text-gray-400 mt-1">{db.description}</p>
                      </div>
                      {db.popular && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                          Popular
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "configure" && currentDbConfig && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <span className="text-2xl">{currentDbConfig.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{currentDbConfig.name}</h3>
                  <p className="text-xs text-gray-400">Configuring database connection</p>
                </div>
              </div>

              {currentDbConfig.requiresUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Globe size={14} /> Connection String / URL
                  </label>
                  <Input
                    placeholder={`${currentDbConfig.name} connection URL`}
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                    className="bg-black/50 border-white/10 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Example: postgresql://user:pass@localhost:5432/dbname
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Key size={14} /> Environment Variables
                </label>
                {currentDbConfig.envVars.map((varName) => (
                  <div key={varName} className="space-y-1">
                    <label className="text-xs text-gray-400 font-mono">{varName}</label>
                    <Input
                      type={varName.toLowerCase().includes("key") || varName.toLowerCase().includes("password") ? "password" : "text"}
                      placeholder={`Enter ${varName}`}
                      value={envVars[varName] || ""}
                      onChange={(e) => handleEnvVarChange(varName, e.target.value)}
                      className="bg-black/50 border-white/10 font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-yellow-500 mt-0.5" />
                  <div className="text-xs text-yellow-400">
                    <p className="font-medium mb-1">What will be generated:</p>
                    <ul className="space-y-1 text-yellow-300/80">
                      <li>• Database client utility (lib/db.ts)</li>
                      <li>• Schema/models based on your project structure</li>
                      <li>• API routes for data operations</li>
                      <li>• .env.local with your configuration</li>
                      <li>• Migration scripts (if applicable)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Check size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Database Configured!</h3>
              <p className="text-gray-400 text-sm">
                The AI has generated the following files for your database integration:
              </p>
              <div className="bg-black/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                {Object.keys(generatedFiles).map((file) => (
                  <div key={file} className="text-left text-sm font-mono text-green-400 py-1">
                    ✓ {file}
                  </div>
                ))}
              </div>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Continue with Database
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "complete" && (
          <div className="px-6 py-4 border-t border-purple-500/20 bg-black/30 flex justify-between">
            {step === "configure" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="border-white/10 hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfigureDatabase}
                  disabled={isConfiguring || (currentDbConfig?.requiresUrl && !connectionString)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isConfiguring ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Configuring...
                    </>
                  ) : (
                    <>
                      <Shield size={16} className="mr-2" />
                      Configure Database
                    </>
                  )}
                </Button>
              </>
            )}
            {step === "select" && (
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/10 hover:bg-white/10 ml-auto"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}