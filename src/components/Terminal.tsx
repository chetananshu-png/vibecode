import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Square, Trash2, Copy } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export function Terminal() {
  const { state, dispatch } = useProject();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalOutput, setTerminalOutput] = useState<Array<{
    type: 'command' | 'output' | 'error';
    content: string;
    timestamp: Date;
  }>>([
    {
      type: 'output',
      content: 'Welcome to CAPM Studio Terminal\nType "help" for available commands',
      timestamp: new Date()
    }
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalOutput]);

  const addOutput = (content: string, type: 'output' | 'error' = 'output') => {
    setTerminalOutput(prev => [...prev, {
      type,
      content,
      timestamp: new Date()
    }]);
  };

  const executeCommand = async (command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Add command to output
    setTerminalOutput(prev => [...prev, {
      type: 'command',
      content: `$ ${trimmedCommand}`,
      timestamp: new Date()
    }]);

    // Add to history
    setHistory(prev => [...prev, trimmedCommand]);
    setHistoryIndex(-1);

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 100));

    const args = trimmedCommand.split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'help':
        addOutput(`Available commands:
  help                 - Show this help message
  ls                   - List files and directories
  cat <file>           - Display file contents
  npm install          - Install project dependencies
  npm start            - Start the CAPM application
  npm run watch        - Start in watch mode
  npm run build        - Build the application
  npm run deploy       - Deploy to SAP BTP
  cds version          - Show CDS version
  cds watch            - Start CDS in watch mode
  cds deploy           - Deploy database schema
  clear                - Clear terminal
  pwd                  - Show current directory
  tree                 - Show project structure`);
        break;

      case 'ls':
        if (args[1]) {
          const path = args[1];
          const folder = findFolderByPath(state.files, path === '.' ? '/' : path);
          if (folder && folder.children) {
            const items = folder.children.map(child => 
              child.type === 'folder' ? `${child.name}/` : child.name
            ).join('  ');
            addOutput(items);
          } else {
            addOutput(`ls: cannot access '${path}': No such file or directory`, 'error');
          }
        } else {
          const rootItems = state.files.map(child => 
            child.type === 'folder' ? `${child.name}/` : child.name
          ).join('  ');
          addOutput(rootItems);
        }
        break;

      case 'cat':
        if (args[1]) {
          const filePath = args[1].startsWith('/') ? args[1] : `/${args[1]}`;
          const file = findFileByPath(state.files, filePath);
          if (file && file.type === 'file') {
            addOutput(file.content || '(empty file)');
          } else {
            addOutput(`cat: ${args[1]}: No such file or directory`, 'error');
          }
        } else {
          addOutput('cat: missing file operand', 'error');
        }
        break;

      case 'pwd':
        addOutput('/home/project');
        break;

      case 'tree':
        const treeOutput = generateTreeOutput(state.files);
        addOutput(treeOutput);
        break;

      case 'clear':
        setTerminalOutput([]);
        break;

      case 'npm':
        if (args[1] === 'install') {
          addOutput('📦 Installing dependencies...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          addOutput('✅ Dependencies installed successfully');
          addOutput('Added 247 packages in 12.3s');
        } else if (args[1] === 'start') {
          addOutput('🚀 Starting CAPM application...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          addOutput('📦 Loading CDS configuration...');
          await new Promise(resolve => setTimeout(resolve, 800));
          addOutput('🗄️  Connecting to database...');
          await new Promise(resolve => setTimeout(resolve, 600));
          addOutput('✅ Server started on http://localhost:4004');
          addOutput('📊 Service endpoints:');
          addOutput('  - /odata/v4/main/ (OData API)');
          addOutput('  - /$metadata (Service metadata)');
          dispatch({ type: 'SET_RUNNING', payload: true });
        } else if (args[1] === 'run' && args[2] === 'watch') {
          addOutput('👀 Starting in watch mode...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          addOutput('✅ Watching for file changes...');
          dispatch({ type: 'SET_RUNNING', payload: true });
        } else if (args[1] === 'run' && args[2] === 'build') {
          addOutput('🔨 Building application...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          addOutput('✅ Build completed successfully');
          addOutput('📁 Output written to ./dist/');
        } else {
          addOutput(`npm: unknown command '${args.slice(1).join(' ')}'`, 'error');
        }
        break;

      case 'cds':
        if (args[1] === 'version') {
          addOutput('@sap/cds: 7.4.0');
          addOutput('@sap/cds-dk: 7.4.0');
          addOutput('Node.js: v18.17.0');
        } else if (args[1] === 'watch') {
          addOutput('👀 CDS watching for changes...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          addOutput('✅ Server ready at http://localhost:4004');
          dispatch({ type: 'SET_RUNNING', payload: true });
        } else if (args[1] === 'deploy') {
          addOutput('🗄️  Deploying database schema...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          addOutput('✅ Database schema deployed successfully');
        } else {
          addOutput(`cds: unknown command '${args[1] || ''}'`, 'error');
        }
        break;

      default:
        addOutput(`bash: ${cmd}: command not found`, 'error');
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setTerminalOutput([]);
  };

  const copyOutput = () => {
    const text = terminalOutput.map(item => 
      item.type === 'command' ? item.content : item.content
    ).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-5 h-5 text-green-400" />
          <h2 className="text-white font-medium">Terminal</h2>
          <div className="text-xs text-gray-400">~/project</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyOutput}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Copy output"
          >
            <Copy className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={clearTerminal}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-black text-green-400 font-mono text-sm overflow-hidden">
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto space-y-1"
        >
          {terminalOutput.map((item, index) => (
            <div key={index} className={`whitespace-pre-wrap ${
              item.type === 'command' ? 'text-yellow-400' :
              item.type === 'error' ? 'text-red-400' : 'text-green-400'
            }`}>
              {item.content}
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 p-4 flex items-center space-x-2">
          <span className="text-blue-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-400 outline-none font-mono"
            placeholder="Type a command..."
            autoFocus
          />
        </div>
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

function findFolderByPath(files: any[], path: string): any {
  for (const file of files) {
    if (file.path === path && file.type === 'folder') {
      return file;
    }
    if (file.children) {
      const found = findFolderByPath(file.children, path);
      if (found) return found;
    }
  }
  return null;
}

function generateTreeOutput(files: any[], prefix: string = '', isLast: boolean = true): string {
  let output = '';
  
  files.forEach((file, index) => {
    const isLastItem = index === files.length - 1;
    const connector = isLastItem ? '└── ' : '├── ';
    const icon = file.type === 'folder' ? '📁 ' : '📄 ';
    
    output += `${prefix}${connector}${icon}${file.name}\n`;
    
    if (file.children && file.children.length > 0) {
      const newPrefix = prefix + (isLastItem ? '    ' : '│   ');
      output += generateTreeOutput(file.children, newPrefix, isLastItem);
    }
  });
  
  return output.trim();
}