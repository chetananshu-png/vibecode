import React from 'react';
import { Files, Play, Database, Rocket, Terminal } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'preview', icon: Play, label: 'Preview' },
  { id: 'code', icon: Files, label: 'Explorer' },
  { id: 'terminal', icon: Terminal, label: 'Terminal' },
  { id: 'database', icon: Database, label: 'Database' },
  { id: 'deploy', icon: Rocket, label: 'Deploy' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="flex flex-col space-y-2 p-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`p-3 rounded-lg transition-colors group relative ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}