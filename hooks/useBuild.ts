"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

interface GenerationLogEntry {
  file: string;
  timestamp: Date;
  status: 'generating' | 'complete';
}

interface BuildState {
  files: Record<string, string>;
  isBuilding: boolean;
  progress: number;
  currentFile: string | null;
  generationLog: GenerationLogEntry[];
  error: string | null;
}

interface EditFileResult {
  success: boolean;
  updatedContent: string;
  previewHtml?: string;
  error?: string;
}

export function useBuild() {
  const [state, setState] = useState<BuildState>({
    files: {},
    isBuilding: false,
    progress: 0,
    currentFile: null,
    generationLog: [],
    error: null,
  });

  const rawBufferRef = useRef("");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "Cleanup");
      wsRef.current = null;
    }
  }, []);

  // Stop build function
  const stopBuild = useCallback(() => {
    cleanup();
    setState(prev => ({
      ...prev,
      isBuilding: false,
      currentFile: null,
      progress: 0,
      error: null,
    }));
    toast.info("Build stopped", { position: "bottom-center" });
  }, [cleanup]);

  // Reset state
  const resetState = useCallback(() => {
    setState({
      files: {},
      isBuilding: false,
      progress: 0,
      currentFile: null,
      generationLog: [],
      error: null,
    });
    rawBufferRef.current = "";
  }, []);

  // Set files directly (for edit updates)
  const setFiles = useCallback((files: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      files: files,
    }));
  }, []);

  // Fix double curly braces in JSON
  const fixDoubleBraces = useCallback((text: string): string => {
    let fixed = text.replace(/\{\{/g, '{');
    fixed = fixed.replace(/\}\}/g, '}');
    return fixed;
  }, []);

  // Ultra-robust JSON sanitizer
  const ultraSanitizeJson = useCallback((text: string): string => {
    let sanitized = text.trim();
    
    sanitized = sanitized.replace(/^```(?:json)?\s*/i, "");
    sanitized = sanitized.replace(/\s*```$/i, "");
    sanitized = fixDoubleBraces(sanitized);
    
    const lines = sanitized.split('\n');
    const fixedLines: string[] = [];
    let inString = false;
    
    for (let line of lines) {
      let fixedLine = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '\\') {
          fixedLine += char;
          if (nextChar) {
            fixedLine += nextChar;
            i++;
          }
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          fixedLine += char;
        } else if (!inString) {
          if (char.match(/[a-zA-Z0-9_]/) && (i === 0 || line[i-1] === '{' || line[i-1] === ',')) {
            let keyEnd = i;
            while (keyEnd < line.length && line[keyEnd].match(/[a-zA-Z0-9_]/)) {
              keyEnd++;
            }
            const key = line.substring(i, keyEnd);
            if (line[keyEnd] === ':') {
              fixedLine += `"${key}"`;
              i = keyEnd - 1;
              continue;
            }
          }
          fixedLine += char;
        } else {
          fixedLine += char;
        }
      }
      
      fixedLine = fixedLine.replace(/,\s*$/, '');
      fixedLines.push(fixedLine);
    }
    
    sanitized = fixedLines.join('\n');
    sanitized = sanitized
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
    
    return sanitized;
  }, [fixDoubleBraces]);

  // Extract files using regex patterns
  const extractFilesWithRegex = useCallback((text: string): Record<string, string> => {
    const files: Record<string, string> = {};
    const fixedText = fixDoubleBraces(text);
    
    const patterns = [
      /"([^"]*\.html)"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
      /"([^"]*\.(?:js|jsx|ts|tsx))"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
      /"([^"]*\.css)"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
      /"([^"]*\.json)"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
      /"([^"]*\.(?:md|config|txt))"\s*:\s*"((?:[^"\\]|\\.)*)"/g,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(fixedText)) !== null) {
        const filename = match[1];
        let content = match[2];
        content = content
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        files[filename] = content;
      }
    }
    
    return files;
  }, [fixDoubleBraces]);

  // Robust JSON parser with multiple strategies
  const parseJsonSafely = useCallback((text: string): any => {
    let fixed = fixDoubleBraces(text);
    
    try {
      return JSON.parse(fixed);
    } catch (error) {
      console.log("Direct parse failed");
    }
    
    try {
      const sanitized = ultraSanitizeJson(fixed);
      return JSON.parse(sanitized);
    } catch (error) {
      console.log("Ultra sanitize failed");
    }
    
    try {
      const files = extractFilesWithRegex(fixed);
      if (Object.keys(files).length > 0) {
        return files;
      }
    } catch (error) {
      console.log("Regex extraction failed");
    }
    
    try {
      const jsonMatch = fixed.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sanitized = ultraSanitizeJson(jsonMatch[0]);
        return JSON.parse(sanitized);
      }
    } catch (error) {
      console.log("JSON object extraction failed");
    }
    
    throw new Error("Unable to parse JSON response");
  }, [ultraSanitizeJson, extractFilesWithRegex, fixDoubleBraces]);

  // Extract files from parsed data
  const extractFiles = useCallback((data: any): Record<string, string> => {
    const extractedFiles: Record<string, string> = {};
    
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && (key.includes('.') || key === 'preview_html')) {
          extractedFiles[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          const nested = extractFiles(value);
          Object.assign(extractedFiles, nested);
        }
      }
    }
    
    return extractedFiles;
  }, []);

  // Handle build complete - FIXED VERSION with auto-preview
const handleBuildComplete = useCallback(() => {
  console.log("Build complete message received");
  
  setState(prev => ({
    ...prev,
    isBuilding: false,
    progress: 100,
    currentFile: null,
  }));
  
  toast.success("Build completed successfully!", {
    duration: 3000,
    position: "bottom-center",
  });
  
  cleanup();
}, [cleanup]);

  // EDIT FILE FUNCTION
  const editFile = useCallback(async (
    editDescription: string,
    currentFiles: Record<string, string>
  ): Promise<EditFileResult> => {
    try {
      console.log("Editing with description:", editDescription);
      
      const response = await fetch('https://eaglecode2.onrender.com/api/edit-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          edit_description: editDescription,
          all_files: currentFiles,
          regenerate_preview: true
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setState(prev => {
          const updatedFiles = { ...prev.files };
          
          if (result.edits) {
            result.edits.forEach((edit: any) => {
              updatedFiles[edit.file_path] = edit.updated_content;
            });
          }
          
          if (result.preview_html) {
            updatedFiles.preview_html = result.preview_html;
          }
          
          return {
            ...prev,
            files: updatedFiles
          };
        });
        
        return {
          success: true,
          updatedContent: result.edits?.[0]?.updated_content || "",
          previewHtml: result.preview_html
        };
      } else {
        return {
          success: false,
          updatedContent: "",
          error: result.error || "Edit failed"
        };
      }
    } catch (error) {
      console.error("Edit file error:", error);
      return {
        success: false,
        updatedContent: "",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }, []);











// Handle WebSocket messages - FIXED VERSION WITH BINARY IMAGES
const handleWebSocketMessage = useCallback((event: MessageEvent) => {
  try {
    const rawData = event.data;
    
    let data: any;
    try {
      data = JSON.parse(rawData);
    } catch (parseError) {
      rawBufferRef.current += rawData;
      return;
    }
    
    console.log("WebSocket message:", data.type);
    
    switch (data.type) {
      case "file_generating":
        console.log(`Generating: ${data.file}`);
        setState(prev => ({
          ...prev,
          currentFile: data.file,
          generationLog: [
            ...prev.generationLog,
            {
              file: data.file,
              timestamp: new Date(),
              status: 'generating'
            }
          ],
          progress: Math.min(prev.progress + 3, 95)
        }));
        break;
        
      case "chunk":
        rawBufferRef.current += data.content;
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 0.5, 92)
        }));
        break;
        
      case "file_complete":
        console.log(`File complete: ${data.file}`);
        
        let cleanContent: any = data.content;
        
        // 🔥 FIX: Handle binary image files - decode to REAL binary data
        if (data.binary === true && typeof cleanContent === 'string' && cleanContent.startsWith('__binary_base64__')) {
          console.log(`🖼️ Processing binary image: ${data.file}`);
          
          // Remove the marker prefix
          const base64Data = cleanContent.replace('__binary_base64__', '');
          
          // Decode base64 to REAL binary bytes
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Create blob URL for preview display
          const blob = new Blob([bytes], { type: 'image/jpeg' });
          const blobUrl = URL.createObjectURL(blob);
          



          
          // Store as object with binary data AND blob URL for preview
          cleanContent = {
            __type: 'binary_image',
            data: bytes,           // Raw binary bytes for saving
            blobUrl: blobUrl,      // For preview display
            filename: data.file,
            size: bytes.length
          };
          




          console.log(`✅ Image decoded to binary (${bytes.length} bytes): ${data.file}`);
        } 
        // Handle regular text files
        else if (typeof cleanContent === 'string') {
          cleanContent = cleanContent
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
        }
        
        setState(prev => {
          const newFiles = {
            ...prev.files,
            [data.file]: cleanContent
          };
          console.log(`Total files: ${Object.keys(newFiles).length}`);
          
          return {
            ...prev,
            files: newFiles,
            generationLog: prev.generationLog.map(log =>
              log.file === data.file
                ? { ...log, status: 'complete' }
                : log
            ),
            currentFile: prev.currentFile === data.file ? null : prev.currentFile,
            progress: Math.min(prev.progress + 5, 95)
          };
        });
        break;
        
      case "complete":
        console.log("Complete message received");
        handleBuildComplete();
        break;
        
      case "preview":
        console.log("📺 RECEIVED PREVIEW FROM BACKEND!");
        console.log("  - preview_type:", data.preview_type);
        console.log("  - html length:", data.html?.length);
        console.log("  - html first 200 chars:", data.html?.substring(0, 200));
        
        setState(prev => ({
          ...prev,
          files: {
            ...prev.files,
            preview_html: data.html
          }
        }));
        break;

      case "error":
        console.log("Raw error data:", data);
        const errorMsg = data.message || "AI Generation Failed";
        console.error("Server error:", errorMsg);
        setState(prev => ({
          ...prev,
          error: errorMsg,
          isBuilding: false,
        }));
        toast.error(errorMsg);
        cleanup();
        break;
        
      case "progress":
        console.log(`Progress: ${data.progress}%`);
        setState(prev => ({
          ...prev,
          progress: data.progress || prev.progress
        }));
        break;
        
      default:
        console.log("Unknown message type:", data.type);
        if (rawData.trim().startsWith('{') || rawData.trim().startsWith('[')) {
          rawBufferRef.current += rawData;
        }
    }
  } catch (err) {
    console.error("WebSocket Message Error:", err);
    rawBufferRef.current += event.data;
  }
}, [handleBuildComplete, cleanup]);

















  // Setup WebSocket connection - FIXED VERSION with better error handling
const setupWebSocket = useCallback((prompt: string): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    cleanup();
    





// Determine WebSocket URL based on environment
const getWebSocketUrl = () => {
  // Check if we're in production (HTTPS)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return 'wss://eaglecode2.onrender.com/ws/build';
  }
  // Local development (HTTP)
  return 'ws://localhost:8000/ws/build';
};

const wsUrl = getWebSocketUrl();















    console.log("🟡 Connecting to WebSocket:", wsUrl);
    






    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.error("🔴 WebSocket connection timeout");
        ws.close();
        reject(new Error("Connection timeout - Backend not running on port 8000"));
      }
    }, 5000);
    
    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log("🟢 WebSocket connected successfully");
      
      // Send the prompt immediately after connection
      const message = JSON.stringify({ prompt });
      ws.send(message);
      console.log("📤 Sent prompt:", prompt);
      console.log("📤 Full message:", message);
      
      // Setup heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
      
      reconnectAttemptsRef.current = 0;
      resolve(ws);
    };
    
    ws.onmessage = (event) => {
      console.log("📨 WebSocket message received:", event.data.substring(0, 100));
      handleWebSocketMessage(event);
    };
    
    ws.onerror = (error) => {
      clearTimeout(connectionTimeout);
      console.error("🔴 WebSocket error:", error);
      console.error("🔴 Make sure backend is running on port 8000");
      reject(new Error("Cannot connect to backend. Please run: python main.py"));
    };
    
    ws.onclose = (event) => {
      clearTimeout(connectionTimeout);
      console.log("🔴 WebSocket closed:", event.code, event.reason);
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      if (state.isBuilding && event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const delay = 3000 * reconnectAttemptsRef.current;
        console.log(`Attempting to reconnect in ${delay}ms...`);
        setTimeout(() => {
          setupWebSocket(prompt).catch(console.error);
        }, delay);
      } else if (state.isBuilding) {
        setState(prev => ({
          ...prev,
          isBuilding: false,
          error: "Connection lost. Please make sure backend is running on port 8000",
        }));
        toast.error("Backend not connected. Please run: python main.py");
      }
    };
  });
}, [cleanup, handleWebSocketMessage, state.isBuilding]);

  /// Start build function - FIXED VERSION
const startBuild = useCallback(async (prompt: string) => {
  if (!prompt.trim()) {
    toast.error("Please enter a prompt");
    return;
  }
  
  if (state.isBuilding) {
    toast.warning("Build already in progress");
    return;
  }
  
  console.log("🚀 Starting build with prompt:", prompt);
  
  resetState();
  setState(prev => ({
    ...prev,
    isBuilding: true,
    progress: 5,
    error: null,
  }));
  
  try {
    // Ensure WebSocket is properly set up and connected
    const ws = await setupWebSocket(prompt);
    
    // The prompt is sent in ws.onopen, so we're good
    console.log("✅ WebSocket connected and build started");
    
  } catch (err) {
    console.error("❌ Failed to start build:", err);
    setState(prev => ({
      ...prev,
      isBuilding: false,
      error: err instanceof Error ? err.message : "Failed to connect",
    }));
    toast.error("Failed to connect to build server. Make sure backend is running on port 8000");
  }
}, [state.isBuilding, resetState, setupWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    files: state.files,
    setFiles: setFiles,
    isBuilding: state.isBuilding,
    progress: state.progress,
    currentFile: state.currentFile,
    generationLog: state.generationLog,
    error: state.error,
    startBuild,
    stopBuild,
    editFile,
  };
}