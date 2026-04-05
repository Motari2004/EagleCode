"use client";

import { useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

interface CodeEditorProps {
  file: string;
  content: string;
  onChange?: (content: string) => void;
}

export function CodeEditor({ file, content, onChange }: CodeEditorProps) {
  const getLanguage = (filename: string): string => {
    if (filename.endsWith(".tsx") || filename.endsWith(".ts")) return "typescript";
    if (filename.endsWith(".js")) return "javascript";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".json")) return "json";
    if (filename.endsWith(".md")) return "markdown";
    if (filename.endsWith(".html")) return "html";
    if (filename.endsWith(".py")) return "python";
    return "typescript";
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Select a file to view the code</p>
          <p className="text-xs mt-1">Click on any file in the file tree</p>
        </div>
      </div>
    );
  }

  return (
    <MonacoEditor
      height="100%"
      language={getLanguage(file)}
      theme="vs-dark"
      value={content}
      onChange={(value) => onChange?.(value || "")}
      options={{
        readOnly: false,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "Monaco, 'Cascadia Code', monospace",
        tabSize: 2,
        wordWrap: "on",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        renderWhitespace: "selection",
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
}