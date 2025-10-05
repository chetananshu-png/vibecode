import React, { useEffect, useRef } from 'react';
import { useProject } from '../context/ProjectContext';

export function CodeEditor() {
  const { state, dispatch } = useProject();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const activeFileNode = state.activeFile 
    ? findFileByPath(state.files, state.activeFile)
    : null;

  const handleContentChange = (content: string) => {
    if (state.activeFile) {
      dispatch({
        type: 'UPDATE_FILE_CONTENT',
        payload: { path: state.activeFile, content }
      });
    }
  };

  useEffect(() => {
    if (editorRef.current && activeFileNode?.content) {
      editorRef.current.value = activeFileNode.content;
    }
  }, [activeFileNode]);

  if (!state.activeFile || !activeFileNode) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">No file selected</h3>
          <p>Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  const getLanguageFromPath = (path: string) => {
    const ext = path.split('.').pop();
    switch (ext) {
      case 'cds': return 'cds';
      case 'js': return 'javascript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
    }
  };

  const language = getLanguageFromPath(state.activeFile);

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white">{activeFileNode.name}</span>
          <span className="text-xs text-gray-400 uppercase">{language}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span>UTF-8</span>
          <span>LF</span>
          <span>Spaces: 2</span>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bg-gray-800 text-gray-500 text-sm font-mono py-4 pl-2 pr-3 pointer-events-none select-none border-r border-gray-700 z-10">
          {(activeFileNode.content || '').split('\n').map((_, index) => (
            <div key={index} className="h-6 leading-6 text-right min-w-[2rem]">
              {index + 1}
            </div>
          ))}
        </div>
        
        <textarea
          ref={editorRef}
          className="absolute inset-0 w-full h-full bg-gray-900 text-gray-100 font-mono text-sm py-4 pr-4 resize-none outline-none border-none"
          style={{ 
            paddingLeft: `${Math.max(60, (activeFileNode.content || '').split('\n').length.toString().length * 8 + 32)}px`,
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
            lineHeight: '1.5',
            tabSize: 2
          }}
          defaultValue={activeFileNode.content || ''}
          onChange={(e) => handleContentChange(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function findFileByPath(files: any[], path: string): any {
  for (const file of files) {
    if (file.path === path) {
      return file;
    }
    if (file.children) {
      const found = findFileByPath(file.children, path);
      if (found) return found;
    }
  }
  return null;
}