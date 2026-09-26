import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('eddy.cifuentes@segurosbolivar.com');
  const [password, setPassword] = useState('password');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    navigate('/#/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OPI 2026</h1>
          <p className="text-gray-600">Transformación Demo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Ingresar
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-800">
            Email: <span className="font-mono">eddy.cifuentes@segurosbolivar.com</span>
          </p>
          <p className="text-xs text-blue-800">
            Password: <span className="font-mono">password</span>
          </p>
        </div>
      </div>
    </div>
  );
};
