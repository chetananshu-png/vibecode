import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface ProjectState {
  currentProject: string | null;
  files: FileNode[];
  activeFile: string | null;
  isRunning: boolean;
  output: string[];
  aiHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>;
  hasProject: boolean;
  isCreatingProject: boolean;
}

type ProjectAction = 
  | { type: 'SET_PROJECT'; payload: string }
  | { type: 'SET_FILES'; payload: FileNode[] }
  | { type: 'SET_ACTIVE_FILE'; payload: string }
  | { type: 'UPDATE_FILE_CONTENT'; payload: { path: string; content: string } }
  | { type: 'ADD_FILE'; payload: FileNode }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'TOGGLE_FOLDER'; payload: string }
  | { type: 'SET_RUNNING'; payload: boolean }
  | { type: 'ADD_OUTPUT'; payload: string }
  | { type: 'CLEAR_OUTPUT' }
  | { type: 'ADD_AI_MESSAGE'; payload: { role: 'user' | 'assistant'; content: string } }
  | { type: 'UPDATE_AI_MESSAGE'; payload: { index: number; content: string } }
  | { type: 'CREATE_PROJECT'; payload: { name: string; template: string } }
  | { type: 'SET_CREATING_PROJECT'; payload: boolean }
  | { type: 'RESET_PROJECT' }
  | { type: 'ADD_FILE_TO_PATH'; payload: { file: FileNode; folderPath: string } };

const initialState: ProjectState = {
  currentProject: null,
  files: [],
  activeFile: null,
  isRunning: false,
  output: [],
  aiHistory: [],
  hasProject: false,
  isCreatingProject: false
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'SET_ACTIVE_FILE':
      return { ...state, activeFile: action.payload };
    case 'UPDATE_FILE_CONTENT':
      return {
        ...state,
        files: updateFileContent(state.files, action.payload.path, action.payload.content)
      };
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.payload] };
    case 'DELETE_FILE':
      return { ...state, files: deleteFileFromTree(state.files, action.payload) };
    case 'TOGGLE_FOLDER':
      return { ...state, files: toggleFolderInTree(state.files, action.payload) };
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload };
    case 'ADD_OUTPUT':
      return { ...state, output: [...state.output, action.payload] };
    case 'CLEAR_OUTPUT':
      return { ...state, output: [] };
    case 'ADD_AI_MESSAGE':
      return {
        ...state,
        aiHistory: [...state.aiHistory, { ...action.payload, timestamp: Date.now() }]
      };
    case 'UPDATE_AI_MESSAGE':
      return {
        ...state,
        aiHistory: state.aiHistory.map((message, index) =>
          index === action.payload.index
            ? { ...message, content: action.payload.content }
            : message
        )
      };
    case 'CREATE_PROJECT':
      const projectFiles = generateProjectStructure(action.payload.name, action.payload.template);
      return {
        ...state,
        currentProject: action.payload.name,
        files: projectFiles,
        activeFile: '/db/schema.cds',
        hasProject: true,
        isCreatingProject: false,
        output: [
          '🚀 Starting CAPM application...',
          '📦 Installing dependencies...',
          '✅ Application started on http://localhost:4004'
        ],
        aiHistory: [{
          role: 'assistant',
          content: `Welcome to your new CAPM project "${action.payload.name}"! 🎉

I've created a basic SAP CAPM project structure for you:

📁 **Database Layer** (/db/schema.cds)
- Entity definitions and data models
- Relationships and associations

📁 **Service Layer** (/srv/)
- service.cds: OData service definitions
- handlers.js: Business logic and event handlers

📁 **Configuration**
- package.json: Dependencies and scripts
- README.md: Project documentation

**I can help you with:**
🏗️ **Full-Stack Development**: Generate complete CAPM + UI5/Fiori Elements applications
📊 **Entity Design**: Create complex data models with relationships
⚡ **Business Logic**: Implement handlers, validations, and custom actions
🎨 **UI5 Frontend**: Build Fiori Elements apps (ListReport, ObjectPage)
🔗 **Integration**: Connect backend services with frontend applications
📦 **Deployment**: Configure for local, Docker, or SAP BTP deployment

**Quick Start Examples:**
- "Create a complete book management system with Fiori Elements UI"
- "Add a customer entity with orders relationship"
- "Generate a ListReport app for sales orders"
- "Create sample data for testing"

Just describe what you want to build and I'll generate complete, working code! 🚀`,
          timestamp: Date.now()
        }],
        isRunning: true
      };
    case 'SET_CREATING_PROJECT':
      return { ...state, isCreatingProject: action.payload };
    case 'ADD_FILE_TO_PATH':
      // First ensure the folder path exists
      const filesWithFolders = ensureFolderExists(state.files, action.payload.folderPath);
      // Then add the file to the specified path
      const updatedFiles = addFileToPath(filesWithFolders, action.payload.file, action.payload.folderPath);
      return { ...state, files: updatedFiles };
    default:
      return state;
  }
}

function updateFileContent(files: FileNode[], path: string, content: string): FileNode[] {
  return files.map(file => {
    if (file.path === path) {
      return { ...file, content };
    }
    if (file.children) {
      return { ...file, children: updateFileContent(file.children, path, content) };
    }
    return file;
  });
}

function deleteFileFromTree(files: FileNode[], path: string): FileNode[] {
  return files.filter(file => {
    if (file.path === path) return false;
    if (file.children) {
      file.children = deleteFileFromTree(file.children, path);
    }
    return true;
  });
}

function toggleFolderInTree(files: FileNode[], path: string): FileNode[] {
  return files.map(file => {
    if (file.path === path && file.type === 'folder') {
      return { ...file, isOpen: !file.isOpen };
    }
    if (file.children) {
      return { ...file, children: toggleFolderInTree(file.children, path) };
    }
    return file;
  });
}

function addFileToPath(files: FileNode[], newFile: FileNode, targetFolderPath: string): FileNode[] {
  // If adding to root
  if (targetFolderPath === '/') {
    // Check if file already exists at root
    const existingIndex = files.findIndex(f => f.path === newFile.path);
    if (existingIndex >= 0) {
      // Replace existing file
      const updatedFiles = [...files];
      updatedFiles[existingIndex] = newFile;
      return updatedFiles;
    }
    return [...files, newFile];
  }

  // Find the target folder and add file to it
  return files.map(file => {
    if (file.path === targetFolderPath && file.type === 'folder') {
      const children = file.children || [];
      const existingIndex = children.findIndex(f => f.path === newFile.path);
      
      if (existingIndex >= 0) {
        // Replace existing file
        const updatedChildren = [...children];
        updatedChildren[existingIndex] = newFile;
        return { ...file, children: updatedChildren };
      }
      
      return { ...file, children: [...children, newFile] };
    }
    
    if (file.children) {
      return { ...file, children: addFileToPath(file.children, newFile, targetFolderPath) };
    }
    
    return file;
  });
}

function ensureFolderExists(files: FileNode[], folderPath: string): FileNode[] {
  if (folderPath === '/') return files;
  
  const pathParts = folderPath.split('/').filter(Boolean);
  let currentPath = '';
  let currentFiles = files;
  
  for (const part of pathParts) {
    currentPath += `/${part}`;
    
    // Check if folder exists at current level
    const folderExists = findFolderAtPath(currentFiles, currentPath);
    
    if (!folderExists) {
      // Create the folder
      const newFolder: FileNode = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: part,
        type: 'folder',
        path: currentPath,
        children: [],
        isOpen: true
      };
      
      // Add folder to appropriate location
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
      currentFiles = addFileToPath(currentFiles, newFolder, parentPath);
    }
  }
  
  return currentFiles;
}

function findFolderAtPath(files: FileNode[], path: string): FileNode | null {
  for (const file of files) {
    if (file.path === path && file.type === 'folder') {
      return file;
    }
    if (file.children) {
      const found = findFolderAtPath(file.children, path);
      if (found) return found;
    }
  }
  return null;
}

function generateProjectStructure(projectName: string, template: string): FileNode[] {
  const namespace = projectName.toLowerCase().replace(/[^a-z0-9]/g, '.');
  
  const templates = {
    basic: {
      schema: `namespace ${namespace};

entity SalesOrder {
  key ID: UUID;
  orderNumber: String(20) @mandatory;
  customer: Association to Customer;
  amount: Decimal(10,2);
  createdAt: DateTime @cds.on.insert: $now;
  modifiedAt: DateTime @cds.on.insert: $now @cds.on.update: $now;
}

entity Customer {
  key ID: UUID;
  name: String(100) @mandatory;
  email: String(100);
  orders: Composition of many SalesOrder on orders.customer = $self;
}`,
      service: `using ${namespace} as db from '../db/schema';

service SalesOrderService {
  entity SalesOrders as projection on db.SalesOrder;
  entity Customers as projection on db.Customer;
  
  action createBulkOrders(orders: array of SalesOrders) returns array of SalesOrders;
}`,
      handlers: `const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  const { SalesOrders, Customers } = this.entities;

  this.before('CREATE', 'SalesOrders', async (req) => {
    const { orderNumber } = req.data;
    if (!orderNumber) {
      req.error(400, 'Order number is required');
    }
  });

  this.on('createBulkOrders', async (req) => {
    const { orders } = req.data;
    const results = [];
    
    for (const order of orders) {
      const result = await INSERT.into(SalesOrders).entries(order);
      results.push(result);
    }
    
    return results;
  });
});`
    },
    empty: {
      schema: `namespace ${namespace};

// Define your entities here
`,
      service: `using ${namespace} as db from '../db/schema';

service MainService {
  // Define your service here
}`,
      handlers: `const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  // Add your service handlers here
});`
    }
  };

  const selectedTemplate = templates[template as keyof typeof templates] || templates.basic;

  return [
    {
      id: '2',
      name: 'db',
      type: 'folder',
      path: '/db',
      isOpen: true,
      children: [
        {
          id: '3',
          name: 'schema.cds',
          type: 'file',
          path: '/db/schema.cds',
          content: selectedTemplate.schema
        }
      ]
    },
    {
      id: '4',
      name: 'srv',
      type: 'folder',
      path: '/srv',
      isOpen: true,
      children: [
        {
          id: '5',
          name: 'service.cds',
          type: 'file',
          path: '/srv/service.cds',
          content: selectedTemplate.service
        },
        {
          id: '6',
          name: 'handlers.js',
          type: 'file',
          path: '/srv/handlers.js',
          content: selectedTemplate.handlers
        }
      ]
    },
    {
      id: '7',
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      content: `{
  "name": "${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "version": "1.0.0",
  "description": "SAP CAPM Application",
  "main": "server.js",
  "scripts": {
    "start": "cds run",
    "watch": "cds watch",
    "build": "cds build",
    "deploy": "cds deploy",
    "build:ui": "ui5 build",
    "serve:ui": "ui5 serve"
  },
  "dependencies": {
    "@sap/cds": "^7.4.0",
    "@sap/cds-dk": "^7.4.0",
    "express": "^4.18.0",
    "pg": "^8.8.0"
  },
  "devDependencies": {
    "@ui5/cli": "^3.0.0",
    "@sap/ui5-builder-webide-extension": "^1.1.8"
  },
  "cds": {
    "requires": {
      "db": {
        "kind": "postgres"
      }
    },
    "build": {
      "target": ".",
      "tasks": [
        {
          "for": "hana",
          "dest": "../db"
        },
        {
          "for": "node-cf"
        }
      ]
    }
  },
  "ui5": {
    "dependencies": [
      "@sap/ui5-builder-webide-extension"
    ]
  }
}`
    },
    {
      id: '8',
      name: 'README.md',
      type: 'file',
      path: '/README.md',
      content: `# ${projectName}

A SAP CAPM (Cloud Application Programming Model) application.

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Start the application:
   \`\`\`
   npm start
   \`\`\`

3. Open your browser and navigate to http://localhost:4004

## Project Structure

- \`db/\` - Database schema and data models
- \`srv/\` - Service definitions and handlers
- \`package.json\` - Project configuration and dependencies

## Learn More

- [SAP CAPM Documentation](https://cap.cloud.sap/docs/)
- [CDS Language Reference](https://cap.cloud.sap/docs/cds/)
`
    }
  ];
}

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}