import React, { useState } from 'react';
import { Sparkles, Code2, FileCode, Zap, CheckCircle } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { VibeCodeLogo } from './VibeCodeLogo';

interface ProjectCreationProps {
  onLogin?: () => void;
  onNavigateHome?: () => void;
}

export function ProjectCreation({ onLogin, onNavigateHome }: ProjectCreationProps) {
  const { dispatch: projectDispatch } = useProject();
  const { state: authState, dispatch: authDispatch } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [template, setTemplate] = useState<'basic' | 'empty' | 'ai-generated'>('basic');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const templates = [
    {
      id: 'basic' as const,
      name: 'Basic CAPM',
      description: 'Start with a pre-configured CAPM project including sample entities and services',
      icon: Code2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'empty' as const,
      name: 'Empty Project',
      description: 'Start from scratch with minimal boilerplate',
      icon: FileCode,
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'ai-generated' as const,
      name: 'AI Generated',
      description: 'Let AI create a custom project based on your requirements',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    if (!authState.isAuthenticated) {
      onLogin?.();
      return;
    }

    setIsCreating(true);

    try {
      const project = {
        id: Date.now().toString(),
        name: projectName,
        description: description || `A ${template} CAPM project`,
        template,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isActive: true
      };

      authDispatch({ type: 'ADD_PROJECT', payload: project });
      authDispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });

      setTimeout(() => {
        projectDispatch({ type: 'CREATE_PROJECT', payload: { name: projectName, template } });
        setIsCreating(false);
      }, 500);
    } catch (error) {
      console.error('Failed to create project:', error);
      setIsCreating(false);
      alert('Failed to create project. Please try again.');
    }
  };

  const features = [
    'AI-powered code generation',
    'Real-time collaboration',
    'Integrated database management',
    'One-click deployment',
    'Built-in terminal and preview',
    'Version control integration'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <VibeCodeLogo size="medium" className="mb-6" onClick={onNavigateHome} />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Create Your Project
            </h1>
            <p className="text-xl text-gray-300">
              Build powerful SAP CAPM applications with AI assistance
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Quick Start</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Get started in seconds with our intuitive interface. No complex setup required.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold">AI-Powered</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Let AI help you write code, debug issues, and build features faster than ever.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center bg-gray-900/50">
          <div className="w-full max-w-lg">
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold mb-6">Project Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will you build?"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Choose Template
                  </label>
                  <div className="space-y-3">
                    {templates.map((tmpl) => {
                      const Icon = tmpl.icon;
                      return (
                        <button
                          key={tmpl.id}
                          onClick={() => setTemplate(tmpl.id)}
                          disabled={isCreating}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            template === tmpl.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                          } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tmpl.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white mb-1">{tmpl.name}</h4>
                              <p className="text-sm text-gray-400">{tmpl.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleCreateProject}
                  disabled={isCreating || !projectName.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Project...</span>
                    </span>
                  ) : (
                    'Create Project'
                  )}
                </button>

                {!authState.isAuthenticated && (
                  <p className="text-sm text-gray-400 text-center">
                    Creating a project will prompt you to sign in
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
