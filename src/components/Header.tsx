import React from 'react';
import { Play, Square, GitBranch, Settings, User, RotateCcw, LogOut } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { VibeCodeLogo } from './VibeCodeLogo';

interface HeaderProps {
  onNavigateHome: () => void;
  onShowAuth?: () => void;
}

export function Header({ onNavigateHome, onShowAuth }: HeaderProps) {
  const { state, dispatch } = useProject();
  const { state: authState, logout } = useAuth();

  const toggleRun = () => {
    dispatch({ type: 'SET_RUNNING', payload: !state.isRunning });
    if (!state.isRunning) {
      dispatch({ type: 'ADD_OUTPUT', payload: '🚀 Starting CAPM application...' });
      dispatch({ type: 'ADD_OUTPUT', payload: '📦 Installing dependencies...' });
      setTimeout(() => {
        dispatch({ type: 'ADD_OUTPUT', payload: '✅ Application started on http://localhost:4004' });
      }, 2000);
    } else {
      dispatch({ type: 'ADD_OUTPUT', payload: '⏹️ Application stopped' });
    }
  };

  const resetProject = () => {
    if (confirm('Are you sure you want to go home? This will close the current project.')) {
      onNavigateHome();
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      onNavigateHome();
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={resetProject}
          className="flex items-center space-x-2 hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
          title="Go to Home"
        >
          <VibeCodeLogo size="small" onClick={resetProject} />
          <span className="font-semibold text-white">VibeCode</span>
        </button>
        
        <div className="h-6 w-px bg-gray-600"></div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <GitBranch className="w-4 h-4" />
          <span>main</span>
          <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">●</span>
        </div>
        
        {state.currentProject && (
          <>
            <div className="h-6 w-px bg-gray-600"></div>
            <span className="text-sm text-gray-300">{state.currentProject}</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleRun}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
              state.isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {state.isRunning ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={resetProject}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            title="New Project"
          >
            <RotateCcw className="w-5 h-5 text-gray-300" />
          </button>
          
          <button className="p-2 hover:bg-gray-700 rounded-md transition-colors">
            <Settings className="w-5 h-5 text-gray-300" />
          </button>
          
          {authState.isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded-md transition-colors">
                {authState.user?.avatar ? (
                  <img
                    src={authState.user.avatar}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm text-gray-300">{authState.user?.name || 'User'}</span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          ) : (
            <button
              onClick={onShowAuth}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}