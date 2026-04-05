"use client";

import { File, Folder, ChevronRight, ChevronDown, Code2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: Record<string, string>;
  onSelectFile: (path: string) => void;
  selectedFile: string;
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

function buildTree(files: Record<string, string>): TreeNode[] {
  const tree: TreeNode[] = [];
  const map: Record<string, TreeNode> = {};
  
  Object.keys(files).forEach(path => {
    const parts = path.split("/");
    let currentPath = "";
    
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const fullPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!map[fullPath]) {
        const node: TreeNode = {
          name: part,
          path: fullPath,
          type: isLast ? "file" : "folder",
          children: isLast ? undefined : []
        };
        map[fullPath] = node;
        
        if (currentPath) {
          if (map[currentPath].children) {
            map[currentPath].children!.push(node);
          }
        } else {
          tree.push(node);
        }
      }
      
      currentPath = fullPath;
    });
  });
  
  // Sort folders first, then files
  const sortNodes = (nodes: TreeNode[]) => {
    return nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "folder" ? -1 : 1;
    });
  };
  
  return sortNodes(tree);
}

function TreeNodeComponent({ 
  node, 
  level = 0,
  onSelect,
  selectedPath 
}: { 
  node: TreeNode; 
  level?: number;
  onSelect: (path: string) => void;
  selectedPath: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-muted transition-colors",
          selectedPath === node.path && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          } else {
            onSelect(node.path);
          }
        }}
      >
        {hasChildren && (
          <span className="w-4 flex-shrink-0">
            {isOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-4 flex-shrink-0" />}
        {node.type === "folder" ? (
          <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
        ) : (
          <Code2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {hasChildren && isOpen && (
        <div>
          {node.children?.map((child, i) => (
            <TreeNodeComponent
              key={i}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, onSelectFile, selectedFile }: FileTreeProps) {
  const tree = buildTree(files);
  
  if (Object.keys(files).length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No files generated yet</p>
        <p className="text-xs mt-1">Enter a prompt to start building</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-0.5">
      {tree.map((node, i) => (
        <TreeNodeComponent
          key={i}
          node={node}
          onSelect={onSelectFile}
          selectedPath={selectedFile}
        />
      ))}
    </div>
  );
}