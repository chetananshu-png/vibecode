import React, { useState } from 'react';
import { Plus, Search, Calendar, Clock, Trash2, CreditCard as Edit3, Play, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { VibeCodeLogo } from './VibeCodeLogo';

interface ProjectDashboardProps {
  onCreateProject: () => void;
  onOpenProject: () => void;
  onNavigateHome: () => void;
}

export function ProjectDashboard({ onCreateProject, onOpenProject, onNavigateHome }: ProjectDashboardProps) {
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { dispatch: projectDispatch } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified'>('modified');

  const user = authState.user!;
  const projects = user.projects || [];

  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'modified':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      authDispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
      
      // Set up the project in the project context
      projectDispatch({ type: 'SET_PROJECT', payload: project.name });
      
      // Small delay to ensure project state is properly set
      setTimeout(() => {
        projectDispatch({ type: 'CREATE_PROJECT', payload: { name: project.name, template: project.template } });
      }, 100);
      
      // Navigate to workspace
      onOpenProject();
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      authDispatch({ type: 'DELETE_PROJECT', payload: projectId });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectIcon = (template: string) => {
    switch (template) {
      case 'ai-generated':
        return '🤖';
      case 'basic':
        return '📦';
      case 'empty':
        return '📄';
      default:
        return '🚀';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <VibeCodeLogo size="small" onClick={onNavigateHome} />
            <span className="font-semibold">VibeCode</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-400">
                Manage your projects and continue building amazing applications
              </p>
            </div>
            <button
              onClick={onCreateProject}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-white">{projects.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold text-white">
                    {projects.filter(p => p.isActive).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Member Since</p>
                  <p className="text-2xl font-bold text-white">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'modified')}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="modified">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            {projects.length === 0 ? (
              <div>
                <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Plus className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Get started by creating your first project. Use our AI agent to generate 
                  custom applications based on your requirements.
                </p>
                <button
                  onClick={onCreateProject}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Project</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
                <p className="text-gray-400">
                  No projects match your search criteria. Try adjusting your search terms.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getProjectIcon(project.template)}</div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-400 capitalize">{project.template}</p>
                    </div>
                  </div>
                  {project.isActive && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-2 mb-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>Modified: {formatDate(project.lastModified)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenProject(project.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Open Project
                  </button>
                  <button
                    onClick={() => {/* TODO: Implement edit */}}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                    title="Edit Project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}