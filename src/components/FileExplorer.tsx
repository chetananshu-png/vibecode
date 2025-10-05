import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useProject, FileNode } from '../context/ProjectContext';

export function FileExplorer() {
  const { state, dispatch } = useProject();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null);

  const renderFileNode = (node: FileNode, level: number = 0) => {
    const isFolder = node.type === 'folder';
    const isActive = state.activeFile === node.path;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center px-2 py-1 hover:bg-gray-800 cursor-pointer group ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (isFolder) {
              dispatch({ type: 'TOGGLE_FOLDER', payload: node.path });
            } else {
              dispatch({ type: 'SET_ACTIVE_FILE', payload: node.path });
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, node });
          }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {isFolder ? (
              node.isOpen ? (
                <ChevronDown className="w-4 h-4 mr-1 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1 flex-shrink-0" />
              )
            ) : (
              <div className="w-4 h-4 mr-1" />
            )}
            
            {isFolder ? (
              node.isOpen ? (
                <FolderOpen className="w-4 h-4 mr-2 flex-shrink-0 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 mr-2 flex-shrink-0 text-blue-400" />
              )
            ) : (
              <File className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
            )}
            
            <span className="text-sm truncate">{node.name}</span>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Add new file/folder logic
              }}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'DELETE_FILE', payload: node.path });
              }}
              className="p-1 hover:bg-red-600 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {isFolder && node.isOpen && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Explorer</h2>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">{state.currentProject}</div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {state.files.map(file => renderFileNode(file))}
      </div>

      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <button className="w-full px-3 py-1 text-left text-sm hover:bg-gray-700 text-white">
            New File
          </button>
          <button className="w-full px-3 py-1 text-left text-sm hover:bg-gray-700 text-white">
            New Folder
          </button>
          <div className="border-t border-gray-600 my-1"></div>
          <button className="w-full px-3 py-1 text-left text-sm hover:bg-red-600 text-white">
            Delete
          </button>
        </div>
      )}
      
      {contextMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}