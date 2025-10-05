import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, AlertCircle, Globe, Smartphone, Tablet } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export function Preview() {
  const { state } = useProject();
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [error, setError] = useState<string | null>(null);
  const [detectedApps, setDetectedApps] = useState<string[]>([]);

  console.log('Preview component - hasProject:', state.hasProject, 'isRunning:', state.isRunning, 'files:', state.files.length);

  // Auto-detect Fiori Elements apps and set appropriate preview URL
  useEffect(() => {
    const apps: string[] = [];

    // Check for Fiori Elements apps in the file structure
    const findFioriApps = (files: any[], basePath = '') => {
      files.forEach(file => {
        if (file.type === 'folder' && file.name === 'webapp' && basePath.includes('app/')) {
          const appName = basePath.split('/').pop();
          if (appName) {
            apps.push(appName);
          }
        }
        if (file.children) {
          findFioriApps(file.children, file.path);
        }
      });
    };

    findFioriApps(state.files);
    setDetectedApps(apps);

    // Set default preview URL based on detected apps
    if (apps.length > 0) {
      setPreviewUrl(`http://localhost:4004/app/${apps[0]}/webapp/index.html`);
    } else {
      // For CAPM projects without Fiori apps, show the service endpoint
      const servicePath = state.files.find(f => f.path === '/srv/service.cds');
      if (servicePath) {
        setPreviewUrl('about:blank');
      } else {
        setPreviewUrl('http://localhost:4004');
      }
    }
  }, [state.files]);

  const refreshPreview = () => {
    setIsLoading(true);
    setError(null);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  const getViewportStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const getViewportIcon = (mode: string) => {
    switch (mode) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Globe;
    }
  };

  if (!state.hasProject) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400 max-w-md">
          <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Globe className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-white">No Project Created</h3>
          <p className="mb-4">
            Create a new CAPM project to see the preview here.
          </p>
        </div>
      </div>
    );
  }

  if (!state.isRunning) {
    return (
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400 max-w-md">
          <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Globe className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-white">Application Not Running</h3>
          <p className="mb-4">
            Start your application to see the preview. Click the "Run" button in the header.
          </p>
          <div className="text-sm text-gray-500">
            Expected server: {previewUrl || 'http://localhost:4004'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      {/* Preview Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-medium">Preview</h2>
          <div className="flex items-center space-x-2">
            {detectedApps.length > 0 && (
              <select
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="http://localhost:4004">Service Root</option>
                <option value="http://localhost:4004/$metadata">Service Metadata</option>
                {detectedApps.map(app => (
                  <option key={app} value={`http://localhost:4004/app/${app}/webapp/index.html`}>
                    {app} App
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500 min-w-[300px]"
              placeholder="http://localhost:4004"
            />
            <button
              onClick={refreshPreview}
              disabled={isLoading}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
              title="Refresh preview"
            >
              <RefreshCw className={`w-4 h-4 text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openInNewTab}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
          {(['desktop', 'tablet', 'mobile'] as const).map((mode) => {
            const Icon = getViewportIcon(mode);
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
        {error ? (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Preview Error</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={refreshPreview}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : previewUrl === 'about:blank' ? (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Globe className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">CAPM Service Running</h2>
              <p className="text-gray-600">Your SAP Cloud Application Programming Model service is active</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Service Endpoints</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Service Root:</span>
                    <code className="bg-white px-3 py-1 rounded text-blue-600">http://localhost:4004</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Metadata:</span>
                    <code className="bg-white px-3 py-1 rounded text-blue-600">http://localhost:4004/$metadata</code>
                  </div>
                </div>
              </div>

              {state.files.some(f => f.path === '/srv/service.cds') && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Available Entities</h3>
                  <p className="text-sm text-gray-700">Check your service.cds file for exposed entities. You can query them using OData.</p>
                </div>
              )}

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Add a UI Application</h3>
                <p className="text-sm text-gray-700">
                  Ask the AI Agent to create a Fiori Elements application to visualize your data. Try:
                </p>
                <code className="block mt-2 bg-white px-3 py-2 rounded text-sm text-gray-800">
                  "Create a ListReport app for SalesOrders"
                </code>
              </div>
            </div>

            <div className="flex space-x-3 justify-center">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setPreviewUrl(e.target.value);
                  }
                }}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">Quick Navigation</option>
                <option value="http://localhost:4004">Service Root</option>
                <option value="http://localhost:4004/$metadata">Service Metadata</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Project Created Successfully</h2>
              <p className="text-gray-600">Your bookstore application is ready with all files generated</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  Files Generated
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-7">
                  <li>✓ Database schema with Books, Authors, and Genres</li>
                  <li>✓ OData services for CRUD operations</li>
                  <li>✓ Business logic and validations</li>
                  <li>✓ SAPUI5 views and controllers</li>
                  <li>✓ Sample data for testing</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Project Structure</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="font-mono bg-white p-3 rounded">
                    <div>📁 db/ - Database schema and models</div>
                    <div>📁 srv/ - Service definitions and handlers</div>
                    <div>📁 webapp/ - SAPUI5 frontend application</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Next Steps</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• Use the Explorer tab to view and edit your files</p>
                  <p>• Ask the AI Agent to add more features or modify existing ones</p>
                  <p>• Check the Database tab to view your data model</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Demo Environment</h3>
                <p className="text-sm text-gray-700">
                  This is a demonstration environment. To run this project locally:
                </p>
                <ol className="text-sm text-gray-700 mt-2 space-y-1 ml-4 list-decimal">
                  <li>Download the project files</li>
                  <li>Run <code className="bg-white px-2 py-1 rounded">npm install</code></li>
                  <li>Start with <code className="bg-white px-2 py-1 rounded">cds watch</code></li>
                </ol>
              </div>
            </div>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => {
                  const explorerTab = document.querySelector('[title="Explorer"]') as HTMLElement;
                  if (explorerTab) explorerTab.click();
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Explore Files
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${state.isRunning ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-gray-300">
              {state.isRunning ? 'Server Running' : 'Server Stopped'}
            </span>
          </div>
          {detectedApps.length > 0 && (
            <div className="text-gray-400 text-sm">
              Detected: {detectedApps.join(', ')} app{detectedApps.length > 1 ? 's' : ''}
            </div>
          )}
          <div className="text-gray-400">
            {previewUrl}
          </div>
        </div>
        <div className="text-gray-400">
          {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
        </div>
      </div>
    </div>
  );
}

export default Preview;