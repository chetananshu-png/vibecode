import React, { useState } from 'react';
import { Rocket, UploadCloud as CloudUpload, Github, Download, Settings, CheckCircle, XCircle, Clock } from 'lucide-react';

export function DeploymentPanel() {
  const [selectedTarget, setSelectedTarget] = useState('btp');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState('ready');

  const deploymentTargets = [
    {
      id: 'btp',
      name: 'SAP BTP Cloud Foundry',
      icon: CloudUpload,
      description: 'Deploy to SAP Business Technology Platform',
      status: 'ready'
    },
    {
      id: 'kyma',
      name: 'SAP BTP Kyma Runtime',
      icon: Rocket,
      description: 'Deploy to Kubernetes-based Kyma environment',
      status: 'coming-soon'
    },
    {
      id: 'github',
      name: 'GitHub Repository',
      icon: Github,
      description: 'Push project to GitHub repository',
      status: 'ready'
    },
    {
      id: 'export',
      name: 'Export Project',
      icon: Download,
      description: 'Download project as ZIP file',
      status: 'ready'
    }
  ];

  const mockDeploy = async () => {
    setIsDeploying(true);
    setDeploymentStatus('building');
    
    // Simulate deployment process
    setTimeout(() => setDeploymentStatus('deploying'), 2000);
    setTimeout(() => setDeploymentStatus('success'), 5000);
    setTimeout(() => {
      setIsDeploying(false);
      setDeploymentStatus('ready');
    }, 7000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'building':
      case 'deploying': return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'building': return 'Building application...';
      case 'deploying': return 'Deploying to BTP...';
      case 'success': return 'Deployment successful!';
      case 'error': return 'Deployment failed';
      default: return 'Ready to deploy';
    }
  };

  return (
    <div className="flex-1 bg-gray-900 flex">
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Deploy Your CAPM Application</h1>
            <p className="text-gray-400">Choose your deployment target and configure the settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {deploymentTargets.map((target) => (
              <div
                key={target.id}
                onClick={() => target.status === 'ready' && setSelectedTarget(target.id)}
                className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedTarget === target.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : target.status === 'ready'
                    ? 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    : 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <target.icon className={`w-8 h-8 ${
                    selectedTarget === target.id ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  {target.status === 'coming-soon' && (
                    <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                
                <h3 className="text-white font-semibold mb-2">{target.name}</h3>
                <p className="text-gray-400 text-sm">{target.description}</p>
              </div>
            ))}
          </div>

          {selectedTarget === 'btp' && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                BTP Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CF API Endpoint
                  </label>
                  <input
                    type="text"
                    defaultValue="https://api.cf.eu10.hana.ondemand.com"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    placeholder="your-org"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Space
                  </label>
                  <input
                    type="text"
                    placeholder="dev"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    defaultValue="my-capm-app"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-gray-300">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Create PostgreSQL service</span>
                </label>
                
                <label className="flex items-center space-x-2 text-gray-300">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable XSUAA authentication</span>
                </label>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Deployment Status</h3>
              {getStatusIcon(deploymentStatus)}
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-gray-300">{getStatusText(deploymentStatus)}</span>
              </div>
              
              {deploymentStatus === 'success' && (
                <div className="bg-green-500/10 border border-green-500 rounded-md p-3">
                  <p className="text-green-400 text-sm mb-2">
                    ✅ Application deployed successfully!
                  </p>
                  <a 
                    href="#" 
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    https://my-capm-app.cfapps.eu10.hana.ondemand.com
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={mockDeploy}
              disabled={isDeploying || selectedTarget !== 'btp'}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
            >
              <Rocket className="w-5 h-5" />
              <span>{isDeploying ? 'Deploying...' : 'Deploy Application'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        <h3 className="text-white font-medium mb-4">Deployment History</h3>
        
        <div className="space-y-3">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">v1.2.0</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xs text-gray-400">
              <div>Jan 15, 2024 2:30 PM</div>
              <div>BTP Cloud Foundry</div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">v1.1.0</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xs text-gray-400">
              <div>Jan 12, 2024 10:15 AM</div>
              <div>BTP Cloud Foundry</div>
            </div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">v1.0.0</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-xs text-gray-400">
              <div>Jan 10, 2024 3:45 PM</div>
              <div>BTP Cloud Foundry</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Environment Variables</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">NODE_ENV</span>
              <span className="text-gray-200">production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">PORT</span>
              <span className="text-gray-200">4004</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">DB_KIND</span>
              <span className="text-gray-200">postgres</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}