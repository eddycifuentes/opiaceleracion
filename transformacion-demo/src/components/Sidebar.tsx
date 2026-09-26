import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, CheckSquare, Play, FileText } from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '#/dashboard' },
    { label: 'Iniciativas', icon: <Zap size={20} />, href: '#/iniciativas' },
    { label: 'Tareas', icon: <CheckSquare size={20} />, href: '#/tareas' },
    { label: 'Sprints', icon: <Play size={20} />, href: '#/sprints' },
    { label: 'Reportes', icon: <FileText size={20} />, href: '#/reportes' },
  ];

  const isActive = (href: string) => {
    return location.hash === href || (location.pathname + location.hash).includes(href.replace('#', ''));
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">OPI 2026</h1>
        <p className="text-gray-400 text-sm">Transformación Demo</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-12 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-400">v1.0.0</p>
        <p className="text-xs text-gray-500 mt-2">© 2025 OPI Aceleración</p>
      </div>
    </aside>
  );
};
