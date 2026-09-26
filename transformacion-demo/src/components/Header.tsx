import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from './Button';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 border-r pr-4">
              <img
                src={user.avatar}
                alt={user.nombre}
                className="w-10 h-10 rounded-full"
              />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
