import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, X, Sparkles, User, Bot, Copy, RotateCcw, CheckCircle, Clock, FileText, Terminal, Play, AlertTriangle, Wrench } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCqrYHlfvTsTS-_aC9NI_jLMuq9cuN1kaw');

interface AIAgentProps {
  onClose: () => void;
}

interface FileProgress {
  path: string;
  status: 'pending' | 'creating' | 'complete';
  content?: string;
}

interface GenerationProgress {
  phase: 'planning' | 'generating' | 'installing' | 'complete';
  message: string;
  files: FileProgress[];
  commands: string[];
}

interface PlanOption {
  id: string;
  label: string;
  selected: boolean;
}

interface PlanSection {
  title: string;
  emoji: string;
  options: PlanOption[];
}

interface InteractivePlan {
  type: 'interactive-plan';
  message: string;
  plan: {
    title: string;
    description: string;
    sections: PlanSection[];
  };
}

export default function AIAgent({ onClose }: AIAgentProps) {
  const { state, dispatch } = useProject();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [detectedErrors, setDetectedErrors] = useState<string[]>([]);
  const [activePlan, setActivePlan] = useState<InteractivePlan | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Error detection from project output
  useEffect(() => {
    const errors = state.output.filter(line => 
      line.toLowerCase().includes('error') || 
      line.toLowerCase().includes('failed') ||
      line.toLowerCase().includes('cannot') ||
      line.includes('✘')
    );
    
    if (errors.length > 0 && errors.length !== detectedErrors.length) {
      setDetectedErrors(errors);
    }
  }, [state.output, detectedErrors.length]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.aiHistory, generationProgress, detectedErrors]);

  const simulateFileCreation = async (files: FileProgress[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Update status to creating
      setGenerationProgress(prev => prev ? {
        ...prev,
        files: prev.files.map(f => 
          f.path === file.path ? { ...f, status: 'creating' } : f
        )
      } : null);
      
      // Simulate creation time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      // Create the file in the project
      if (file.content) {
        const pathParts = file.path.split('/').filter(Boolean);
        const fileName = pathParts.pop() || 'untitled';
        const folderPath = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';
        
        const newFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: fileName,
          type: 'file' as const,
          path: file.path,
          content: file.content
        };

        dispatch({ type: 'ADD_FILE_TO_PATH', payload: { file: newFile, folderPath } });
      }
      
      // Update status to complete
      setGenerationProgress(prev => prev ? {
        ...prev,
        files: prev.files.map(f => 
          f.path === file.path ? { ...f, status: 'complete' } : f
        )
      } : null);
    }
  };

  const simulateCommandExecution = async (commands: string[]) => {
    for (const command of commands) {
      dispatch({ type: 'ADD_OUTPUT', payload: `$ ${command}` });
      
      if (command.includes('npm install')) {
        dispatch({ type: 'ADD_OUTPUT', payload: '📦 Installing dependencies...' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        dispatch({ type: 'ADD_OUTPUT', payload: '✅ Dependencies installed successfully' });
      } else if (command.includes('npm start') || command.includes('cds watch')) {
        dispatch({ type: 'ADD_OUTPUT', payload: '🚀 Starting development server...' });
        await new Promise(resolve => setTimeout(resolve, 1500));
        dispatch({ type: 'ADD_OUTPUT', payload: '✅ Server running on http://localhost:4004' });
        dispatch({ type: 'SET_RUNNING', payload: true });
      }
    }
  };

  const parseAndCreateFiles = async (aiResponse: string) => {
    // Look for code blocks in the AI response
    const codeBlockRegex = /```(?:(\w+)\s+)?(?:\/([^\n]+))?\n([\s\S]*?)```/g;
    let match;
    const filesToCreate: FileProgress[] = [];
    
    // Extract files from code blocks
    let cleanedResponse = aiResponse;

    while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
      const [, language, filePath, content] = match;
      
      if (filePath && content.trim()) {
        const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
        filesToCreate.push({
          path: cleanPath,
          status: 'pending',
          content: content.trim()
        });
      }
    }

    // Clean the response by removing code blocks and creating a simple summary
    if (filesToCreate.length > 0) {
      // Create a simple summary without code blocks
      const summaryResponse = cleanedResponse.replace(codeBlockRegex, '').trim().replace(/\n\s*\n\s*\n/g, '\n\n') + 
        `\n\n✅ **Generated ${filesToCreate.length} files** for your application.\n\n` +
        `🚀 **What's happening:**\n` +
        `• Creating project structure\n` +
        `• Installing dependencies\n` +
        `• Starting development server\n\n` +
        `Check the Preview tab once generation is complete!`;
      
      // Find the last assistant message and update it
      const lastMessage = state.aiHistory[state.aiHistory.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        dispatch({ 
          type: 'UPDATE_AI_MESSAGE', 
          payload: { 
            index: state.aiHistory.length - 1, 
            content: summaryResponse 
          } 
        });
      }
    }

    if (filesToCreate.length > 0) {
      // Initialize progress tracking
      setGenerationProgress({
        phase: 'generating',
        message: `Creating ${filesToCreate.length} files...`,
        files: filesToCreate,
        commands: ['npm install', 'npm start']
      });

      // Create files with progress
      await simulateFileCreation(filesToCreate);

      // Update to installation phase
      setGenerationProgress(prev => prev ? {
        ...prev,
        phase: 'installing',
        message: 'Installing dependencies and starting server...'
      } : null);

      // Execute commands
      await simulateCommandExecution(['npm install', 'npm start']);

      // Complete
      setGenerationProgress(prev => prev ? {
        ...prev,
        phase: 'complete',
        message: 'Project ready! 🎉'
      } : null);

    }

    return filesToCreate.length;
  };

  const handleResolveError = async (errorMessage: string) => {
    const resolvePrompt = `I'm getting this error in my CAPM project:

${errorMessage}

Please help me fix this error. Provide the exact solution and any code changes needed.`;

    setInput(resolvePrompt);
    
    // Auto-submit the error resolution request
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as any);
    }, 100);
  };

  const generateResponse = async (userMessage: string): Promise<string | InteractivePlan> => {
    // Check if this is the first user message (planning phase)
    const isFirstMessage = state.aiHistory.filter(msg => msg.role === 'user').length === 0;

    if (isFirstMessage) {
      // Return planning response object directly
      return generatePlanningResponse(userMessage);
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Build context from project files
      const projectContext = state.files.map(file => {
        if (file.type === 'file' && file.content) {
          return `File: ${file.path}\n${file.content}\n`;
        }
        return '';
      }).join('\n');

      const systemPrompt = `# CAPM + UI5/Fiori Elements App Generator

## Role & Objective
You are an AI code generation assistant specialized in building full-stack SAP applications. You should work like bolt.new - explaining your plan clearly, then generating complete, working code.

**Backend**: SAP CAPM (Node.js, CDS models, SQLite/PostgreSQL)
**Frontend**: SAPUI5 / Fiori Elements apps (choose based on user requirements)

## CRITICAL: Response Format
When the user asks to create an application, analyze their UI framework preference and follow this EXACT structure:

1. **Plan Explanation** (conversational, enthusiastic)
   - Explain what you'll build
   - List the key features
   - Mention the tech stack (including UI framework choice)

2. **File Generation** (use EXACT format below)

   **For Fiori Elements apps**, generate:
   - CDS schema with proper annotations (@UI.LineItem, @UI.HeaderInfo, etc.)
   - Service definitions with annotations
   - App descriptor (manifest.json) for Fiori Elements
   - Annotations file for UI configuration

   **For SAPUI5 apps**, generate:
   - CDS schema (without UI annotations)
   - Service definitions
   - SAPUI5 views (XML)
   - Controllers (JavaScript)
   - App descriptor (manifest.json) for SAPUI5
   - Component.js and index.html

   For each file, use this format:

\`\`\`cds /db/schema.cds
namespace my.salesorder;

entity SalesOrder {
  key ID : UUID;
  orderNumber : String(20) @mandatory;
  customer : Association to Customer;
  amount : Decimal(10,2);
  createdAt : DateTime @cds.on.insert: $now;
}

entity Customer {
  key ID : UUID;
  name : String(100) @mandatory;
  email : String(100);
  orders : Composition of many SalesOrder on orders.customer = $self;
}
\`\`\`

\`\`\`cds /srv/service.cds
using my.salesorder as db from '../db/schema';

service SalesOrderService {
  entity SalesOrders as projection on db.SalesOrder;
  entity Customers as projection on db.Customer;
  
  action createBulkOrders(orders: array of SalesOrders) returns array of SalesOrders;
}
\`\`\`

3. **Next Steps** (what they can do next)

## UI Framework Detection
Look for these keywords in the user message to determine UI framework:
- "Fiori Elements", "ListReport", "ObjectPage", "annotations" → Use Fiori Elements
- "SAPUI5", "custom views", "controllers", "flexible UI" → Use SAPUI5
- If not specified, ask for clarification or default to Fiori Elements for simpler apps

## Current Project Context
Project: "${state.currentProject}"

Current project structure:
${projectContext}

## Example Response for "create sales order app":

I'll create a comprehensive sales order management application for you! This will include:

🏗️ **Database Layer**: Customer and SalesOrder entities with proper relationships
⚡ **Business Logic**: Order validation, bulk operations, and customer management
🎨 **Frontend**: [Fiori Elements ListReport/ObjectPage OR Custom SAPUI5 views] based on your preference
🔗 **API Layer**: RESTful OData services for all CRUD operations
📊 **Sample Data**: Realistic test data to get you started

Let me generate the complete application structure:

[Then include all the code blocks with proper file paths]

## Technical Requirements
- Always provide complete, working code (no placeholders)
- Use proper CDS syntax and SAP best practices
- Generate appropriate UI framework based on user selection
- For Fiori Elements: Include proper annotations and manifest configuration
- For SAPUI5: Include views, controllers, and routing configuration
- Include realistic sample data
- Add proper validations and error handling
- Generate package.json with correct dependencies
- Create README with setup instructions

## User Message
${userMessage}

Generate a complete, production-ready CAPM application with proper file structure and working code.`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Sorry, I encountered an error while generating the response. Please try again.';
    }
  }

  const generatePlanningResponse = (userMessage: string): InteractivePlan => {
    return {
      type: 'interactive-plan',
      message: userMessage,
      plan: {
        title: `Let's build your application!`,
        description: `I'll help you create: **${userMessage}**`,
        sections: [
          {
            title: 'Backend Components',
            emoji: '🔧',
            options: [
              { id: 'entities', label: 'Database entities and relationships', selected: true },
              { id: 'services', label: 'OData services with CRUD operations', selected: true },
              { id: 'business-logic', label: 'Business logic and validations', selected: true },
              { id: 'sample-data', label: 'Sample data for testing', selected: true }
            ]
          },
          {
            title: 'Frontend Options',
            emoji: '🎨',
            options: [
              { id: 'fiori', label: 'Fiori Elements (ListReport + ObjectPage) - Quick setup', selected: true },
              { id: 'sapui5', label: 'Custom SAPUI5 views - Full control', selected: false }
            ]
          },
          {
            title: 'Additional Features',
            emoji: '✨',
            options: [
              { id: 'auth', label: 'Authentication and authorization', selected: false },
              { id: 'search', label: 'Advanced search and filtering', selected: true },
              { id: 'export', label: 'Export/Import functionality', selected: false },
              { id: 'workflows', label: 'Custom actions and workflows', selected: false }
            ]
          }
        ]
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Clear any existing progress when starting new generation
    setGenerationProgress(null);

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to history
    dispatch({ type: 'ADD_AI_MESSAGE', payload: { role: 'user', content: userMessage } });

    try {
      // Generate AI response
      const response = await generateResponse(userMessage);

      // Check if response is an interactive plan object
      if (typeof response === 'object' && response.type === 'interactive-plan') {
        console.log('Received interactive plan object');
        setActivePlan(response);
        dispatch({ type: 'ADD_AI_MESSAGE', payload: { role: 'assistant', content: '$$INTERACTIVE_PLAN$$' } });
        setIsLoading(false);
        return;
      }

      // If response is a string, check if it's JSON that needs parsing
      if (typeof response === 'string') {
        const isFirstMessage = state.aiHistory.filter(msg => msg.role === 'user').length === 1;

        if (isFirstMessage) {
          try {
            // Try to extract JSON from markdown code blocks or raw response
            let jsonStr = response.trim();

            // Method 1: Try to find JSON in code blocks
            const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            if (codeBlockMatch) {
              jsonStr = codeBlockMatch[1].trim();
            } else {
              // Method 2: Try to find JSON object directly (starts with { and ends with })
              const jsonMatch = jsonStr.match(/\{[\s\S]*"type"\s*:\s*"interactive-plan"[\s\S]*\}/);
              if (jsonMatch) {
                jsonStr = jsonMatch[0];
              }
            }

            const planData = JSON.parse(jsonStr) as InteractivePlan;
            if (planData.type === 'interactive-plan') {
              console.log('Successfully parsed interactive plan from string');
              setActivePlan(planData);
              dispatch({ type: 'ADD_AI_MESSAGE', payload: { role: 'assistant', content: '$$INTERACTIVE_PLAN$$' } });
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.log('Failed to parse interactive plan:', e);
            // Not a JSON response, continue with normal flow
          }
        }

        // Add AI response to history
        dispatch({ type: 'ADD_AI_MESSAGE', payload: { role: 'assistant', content: response } });

        // Parse and create files
        await parseAndCreateFiles(response);
      }

    } catch (error) {
      console.error('Error generating response:', error);
      dispatch({
        type: 'ADD_AI_MESSAGE',
        payload: {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleTogglePlanOption = (sectionIndex: number, optionId: string) => {
    if (!activePlan) return;

    setActivePlan({
      ...activePlan,
      plan: {
        ...activePlan.plan,
        sections: activePlan.plan.sections.map((section, idx) => {
          if (idx === sectionIndex) {
            return {
              ...section,
              options: section.options.map(opt =>
                opt.id === optionId ? { ...opt, selected: !opt.selected } : opt
              )
            };
          }
          return section;
        })
      }
    });
  };

  const handleStartDevelopment = async () => {
    if (!activePlan) return;

    const selectedFeatures = activePlan.plan.sections
      .flatMap(section => section.options.filter(opt => opt.selected).map(opt => opt.label))
      .join(', ');

    const developmentPrompt = `Start development with these selected features: ${selectedFeatures}. Build: ${activePlan.message}`;

    setActivePlan(null);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponse(developmentPrompt);
      dispatch({ type: 'ADD_AI_MESSAGE', payload: { role: 'assistant', content: response } });
      await parseAndCreateFiles(response);
    } catch (error) {
      console.error('Error generating response:', error);
      dispatch({
        type: 'ADD_AI_MESSAGE',
        payload: {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInteractivePlan = (plan: InteractivePlan) => (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 shadow-xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.plan.title}</h3>
        <div className="text-gray-700">
          <ReactMarkdown>{plan.plan.description}</ReactMarkdown>
        </div>
      </div>

      <div className="space-y-6">
        {plan.plan.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">{section.emoji}</span>
              <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
            </div>

            <div className="space-y-2">
              {section.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group border border-transparent hover:border-blue-200"
                >
                  <input
                    type="checkbox"
                    checked={option.selected}
                    onChange={() => handleTogglePlanOption(sectionIndex, option.id)}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-gray-800 flex-1 leading-relaxed group-hover:text-gray-900 transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-gray-700">
          Select features and click "Start Development" to begin
        </p>
        <button
          onClick={handleStartDevelopment}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg whitespace-nowrap"
        >
          <Sparkles className="w-5 h-5" />
          <span>Start Development</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Agent</h3>
            <p className="text-xs text-gray-400">CAPM Expert Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.aiHistory.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.content === '$$INTERACTIVE_PLAN$$' && activePlan ? (
              <div className="w-full">
                {renderInteractivePlan(activePlan)}
              </div>
            ) : (
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  {message.role === 'user' && (
                    <User className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {generationProgress && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 relative">
            <button
              onClick={() => setGenerationProgress(null)}
              className="absolute top-2 right-2 p-1 hover:bg-blue-500/20 rounded text-blue-400"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 mb-3">
              {generationProgress.phase === 'complete' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              <span className="text-blue-400 font-medium">{generationProgress.message}</span>
            </div>
            
            {generationProgress.files.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-blue-300 mb-2">
                  Progress: {generationProgress.files.filter(f => f.status === 'complete').length} / {generationProgress.files.length} files
                </div>
                {generationProgress.files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {file.status === 'complete' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : file.status === 'creating' ? (
                      <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`${
                      file.status === 'complete' ? 'text-green-400' : 
                      file.status === 'creating' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {file.path}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {detectedErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Errors Detected</span>
            </div>
            
            <div className="space-y-2">
              {detectedErrors.slice(-3).map((error, index) => (
                <div key={index} className="bg-red-500/5 border border-red-500/20 rounded p-3">
                  <div className="text-red-300 text-sm font-mono mb-2 break-all">
                    {error.length > 100 ? `${error.substring(0, 100)}...` : error}
                  </div>
                  <button
                    onClick={() => handleResolveError(error)}
                    className="flex items-center space-x-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Resolve Error</span>
                  </button>
                </div>
              ))}
            </div>
            
            {detectedErrors.length > 3 && (
              <div className="mt-2 text-xs text-red-400">
                Showing latest 3 errors. Check terminal for full details.
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to create entities, services, or complete applications..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
}