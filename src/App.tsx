import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useProject } from './context/ProjectContext';
import { AuthModal } from './components/AuthModal';
import { ProjectDashboard } from './components/ProjectDashboard';
import { UserProfile } from './components/UserProfile';
import { Sidebar } from './components/Sidebar';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/CodeEditor';
import AIAgent from './components/AIAgent';
import { Preview } from './components/Preview';
import { DatabaseConsole } from './components/DatabaseConsole';
import { DeploymentPanel } from './components/DeploymentPanel';
import { Terminal } from './components/Terminal';
import { Header } from './components/Header';
import { ProjectCreation } from './components/ProjectCreation';
import { ProjectProvider } from './context/ProjectContext';
import { VibeCodeLogo } from './components/VibeCodeLogo';

function AppContent() {
  const { state: authState } = useAuth();
  const { state: projectState } = useProject();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'workspace'>('home');
  const [pendingProjectCreation, setPendingProjectCreation] = useState(false);

  // Watch for project creation and navigate to workspace
  React.useEffect(() => {
    if (projectState.hasProject && currentView !== 'workspace') {
      setCurrentView('workspace');
    }
  }, [projectState.hasProject, currentView]);

  // Handle project creation request
  const handleCreateProject = () => {
    if (!authState.isAuthenticated) {
      setPendingProjectCreation(true);
      setShowAuthModal(true);
    } else {
      setCurrentView('workspace');
    }
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    setShowUserProfile(false); // Ensure user profile is also closed
    if (pendingProjectCreation) {
      setCurrentView('workspace');
      setPendingProjectCreation(false);
    } else {
      setCurrentView('dashboard');
    }
  };

  // Handle navigation to home
  const handleNavigateHome = () => {
    if (!authState.isAuthenticated) {
      setCurrentView('home');
    } else {
      setCurrentView('dashboard');
    }
  };

  // If user is not authenticated and not on home screen, show welcome screen
  if (!authState.isAuthenticated) {
    if (currentView === 'home') {
      return (
        <ProjectProvider>
          <ProjectCreation onLogin={handleCreateProject} />
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => {
              setShowAuthModal(false);
              setPendingProjectCreation(false);
            }}
            onSuccess={handleLoginSuccess}
          />
        </ProjectProvider>
      );
    } else {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
          <div className="text-center">
            <VibeCodeLogo size="large" className="mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Welcome to VibeCode</h1>
            <p className="text-gray-400 mb-8 max-w-md">
              Build powerful applications with AI assistance and modern development tools
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setPendingProjectCreation(false);
                  setShowAuthModal(true);
                }}
                className="w-full max-w-sm px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
              >
                Sign In
              </button>
              <button
                onClick={handleCreateProject}
                className="w-full max-w-sm px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
              >
                Create New Project
              </button>
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-500 mb-2">Demo Account:</p>
                <p className="text-xs text-gray-400">
                  Email: demo@example.com<br />
                  Password: demo123
                </p>
              </div>
            </div>
          </div>
          
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleLoginSuccess}
          />
        </div>
      );
    }
  }

  // Show project creation screen
  if (currentView === 'home') {
    return (
      <ProjectCreation onNavigateHome={handleNavigateHome} />
    );
  }

  // Show project dashboard
  if (currentView === 'dashboard') {
    return (
      <ProjectDashboard 
        onCreateProject={handleCreateProject}
        onOpenProject={() => setCurrentView('workspace')}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  // Show project workspace
  return (
    <ProjectWorkspace onNavigateHome={handleNavigateHome} />
  );
}

function ProjectWorkspace({ onNavigateHome }: { onNavigateHome: () => void }) {
  const { state } = useProject();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [explorerWidth, setExplorerWidth] = useState(320);
  const [aiPanelWidth, setAiPanelWidth] = useState(384);
  const [isResizing, setIsResizing] = useState<'explorer' | 'ai' | null>(null);

  // Ensure AI panel is open when project is created
  React.useEffect(() => {
    if (state.hasProject && !rightPanelOpen) {
      setRightPanelOpen(true);
    }
  }, [state.hasProject]);
  const handleMouseDown = (panel: 'explorer' | 'ai') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(panel);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    if (isResizing === 'explorer') {
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setExplorerWidth(newWidth);
    } else if (isResizing === 'ai') {
      const newWidth = Math.max(300, Math.min(800, window.innerWidth - e.clientX));
      setAiPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing]);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      <Header onNavigateHome={onNavigateHome} onShowAuth={() => setShowAuthModal(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex flex-1 overflow-hidden">
          {activeTab === 'code' && (
            <div className="flex">
              <div style={{ width: explorerWidth }} className="flex-shrink-0">
                <FileExplorer />
              </div>
              <div
                className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize flex-shrink-0"
                onMouseDown={handleMouseDown('explorer')}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'code' && <CodeEditor />}
            {activeTab === 'preview' && <Preview />}
            {activeTab === 'terminal' && <Terminal />}
            {activeTab === 'database' && <DatabaseConsole />}
            {activeTab === 'deploy' && <DeploymentPanel />}
          </div>
          
          {rightPanelOpen && (
            <div className="flex">
              <div 
                className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize flex-shrink-0"
                onMouseDown={handleMouseDown('ai')}
              />
              <div style={{ width: aiPanelWidth }} className="border-l border-gray-700 flex flex-col flex-shrink-0">
                <AIAgent onClose={() => setRightPanelOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open AI Agent"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}

function App() {

  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
        <UserProfile 
          isOpen={false} 
          onClose={() => {}} 
        />
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;