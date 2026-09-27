import { createContext, useContext, useState, ReactNode } from 'react';

// Logger utility
const Logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    nombre: string;
    avatar: string;
  } | null;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<Omit<AuthState, 'login' | 'logout'>>(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
    return { isAuthenticated: false, user: null };
  });

  const login = (email: string, _password: string) => {
    try {
      Logger.info(`[authStore.login] Iniciando sesion para: ${email}`);
      const newState = {
        isAuthenticated: true,
        user: {
          email,
          nombre: "Eddy Cifuentes",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eddy",
        },
      };
      setAuthState(newState);
      localStorage.setItem("auth", JSON.stringify(newState));
      Logger.info(`[authStore.login] Login exitoso: ${email}`);
    } catch (e) {
      Logger.error(`[authStore.login] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo iniciar sesion: ${email}`);
    }
  };

  const logout = () => {
    try {
      Logger.info(`[authStore.logout] Cerrando sesion`);
      setAuthState({ isAuthenticated: false, user: null });
      localStorage.removeItem("auth");
      Logger.info(`[authStore.logout] Logout exitoso`);
    } catch (e) {
      Logger.error(`[authStore.logout] FALLO: ${e instanceof Error ? e.message : 'Error desconocido'}`);
      throw new Error(`No se pudo cerrar sesion`);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthStore must be used within AuthProvider');
  }
  return context;
};
