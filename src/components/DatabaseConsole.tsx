import React, { useState } from 'react';
import { Play, Database, Table, Download, Upload } from 'lucide-react';

export function DatabaseConsole() {
  const [query, setQuery] = useState('SELECT * FROM SalesOrder LIMIT 10;');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const mockExecuteQuery = async () => {
    setIsExecuting(true);
    
    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock results based on query
    const mockResults = [
      { ID: '1', orderNumber: 'SO-001', amount: 1250.00, createdAt: '2024-01-15T10:30:00Z' },
      { ID: '2', orderNumber: 'SO-002', amount: 850.50, createdAt: '2024-01-15T11:15:00Z' },
      { ID: '3', orderNumber: 'SO-003', amount: 2100.00, createdAt: '2024-01-15T14:20:00Z' },
    ];
    
    setResults(mockResults);
    setIsExecuting(false);
  };

  const tables = [
    { name: 'SalesOrder', rows: 1247, size: '2.3 MB' },
    { name: 'Customer', rows: 834, size: '1.8 MB' },
    { name: 'OrderItem', rows: 3521, size: '4.1 MB' },
  ];

  return (
    <div className="flex-1 bg-gray-900 flex">
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-medium">Database Console</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Database className="w-4 h-4 text-green-400" />
              <span>PostgreSQL Connected</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">SQL Query</label>
              <button
                onClick={mockExecuteQuery}
                disabled={isExecuting}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
              </button>
            </div>
            
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
              placeholder="Enter your SQL query here..."
              disabled={isExecuting}
            />
          </div>

          <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <h3 className="text-white font-medium">Query Results</h3>
            </div>
            
            <div className="overflow-auto">
              {results.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Database className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No results to display</p>
                  <p className="text-sm">Execute a query to see results here</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      {Object.keys(results[0]).map((key) => (
                        <th key={key} className="text-left px-4 py-2 text-gray-300 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-gray-200 font-mono text-sm">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        <h3 className="text-white font-medium mb-4">Database Schema</h3>
        
        <div className="space-y-2 mb-6">
          {tables.map((table) => (
            <div
              key={table.name}
              className="bg-gray-700 p-3 rounded-lg hover:bg-gray-650 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2 mb-1">
                <Table className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">{table.name}</span>
              </div>
              <div className="text-xs text-gray-400">
                {table.rows.toLocaleString()} rows • {table.size}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Actions</h4>
          
          <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </button>
          
          <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors">
            <Database className="w-4 h-4" />
            <span>Backup DB</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Connection Info</h4>
          <div className="space-y-1 text-xs text-gray-400">
            <div>Host: localhost:5432</div>
            <div>Database: capm_dev</div>
            <div>Schema: public</div>
            <div>Status: <span className="text-green-400">Connected</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}