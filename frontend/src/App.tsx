import React, { useState } from 'react';
import { CandidateProvider } from './context/CandidateContext';
import CandidateTable from './components/candidates/CandidateTable';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import CommandBar from './components/common/CommandBar';
import FilterBar from './components/candidates/FilterBar';
import { Toaster } from './components/ui/toaster';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  return (
    <CandidateProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            onCommandBarOpen={() => setCommandBarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
                  <p className="text-gray-500">Manage and track your candidates</p>
                </div>

                <FilterBar />
                
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
                  <CandidateTable />
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Command Bar */}
        <CommandBar open={commandBarOpen} onOpenChange={setCommandBarOpen} />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </CandidateProvider>
  );
};

export default App;