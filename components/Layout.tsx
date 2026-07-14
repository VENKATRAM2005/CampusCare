
import React from 'react';
import { UserSession, Role } from '../types';
import { Shield, LogOut, User, Building2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  session: UserSession | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, session, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">CampusCare</span>
            </div>
            
            {session && (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-sm font-semibold text-slate-700">{session.name}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest">{session.role} {session.department ? `| ${session.department}` : ''}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} CampusCare Enterprise. Intelligent Governance for Higher Education.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
