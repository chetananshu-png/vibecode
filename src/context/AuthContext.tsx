import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  projects: UserProject[];
}

export interface UserProject {
  id: string;
  name: string;
  description: string;
  template: string;
  createdAt: string;
  lastModified: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'ADD_PROJECT'; payload: UserProject }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<UserProject> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_ACTIVE_PROJECT'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true, error: null };
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null
      };
    
    case 'LOGOUT':
      localStorage.removeItem('capm_user');
      return {
        ...initialState
      };
    
    case 'UPDATE_PROFILE':
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...action.payload };
      localStorage.setItem('capm_user', JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser
      };
    
    case 'ADD_PROJECT':
      if (!state.user) return state;
      const userWithNewProject = {
        ...state.user,
        projects: [...state.user.projects, action.payload]
      };
      localStorage.setItem('capm_user', JSON.stringify(userWithNewProject));
      return {
        ...state,
        user: userWithNewProject
      };
    
    case 'UPDATE_PROJECT':
      if (!state.user) return state;
      const userWithUpdatedProject = {
        ...state.user,
        projects: state.user.projects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates }
            : project
        )
      };
      localStorage.setItem('capm_user', JSON.stringify(userWithUpdatedProject));
      return {
        ...state,
        user: userWithUpdatedProject
      };
    
    case 'DELETE_PROJECT':
      if (!state.user) return state;
      const userWithDeletedProject = {
        ...state.user,
        projects: state.user.projects.filter(project => project.id !== action.payload)
      };
      localStorage.setItem('capm_user', JSON.stringify(userWithDeletedProject));
      return {
        ...state,
        user: userWithDeletedProject
      };
    
    case 'SET_ACTIVE_PROJECT':
      if (!state.user) return state;
      const userWithActiveProject = {
        ...state.user,
        projects: state.user.projects.map(project => ({
          ...project,
          isActive: project.id === action.payload
        }))
      };
      localStorage.setItem('capm_user', JSON.stringify(userWithActiveProject));
      return {
        ...state,
        user: userWithActiveProject
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Mock authentication functions
const mockLogin = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  
  if (email === 'demo@example.com' && password === 'demo123') {
    return {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      createdAt: '2024-01-01T00:00:00Z',
      projects: [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'Full-featured online store with inventory management',
          template: 'ai-generated',
          createdAt: '2024-01-15T10:00:00Z',
          lastModified: '2024-01-20T14:30:00Z',
          isActive: false
        },
        {
          id: '2',
          name: 'Customer Management',
          description: 'CRM system for managing customer relationships',
          template: 'ai-generated',
          createdAt: '2024-01-10T09:00:00Z',
          lastModified: '2024-01-18T16:45:00Z',
          isActive: false
        }
      ]
    };
  }
  
  throw new Error('Invalid email or password');
};

const mockRegister = async (email: string, password: string, name: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API call
  
  if (email && password && name) {
    return {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date().toISOString(),
      projects: []
    };
  }
  
  throw new Error('Registration failed');
};

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('capm_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('capm_user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await mockLogin(email, password);
      localStorage.setItem('capm_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: (error as Error).message });
    }
  };

  const register = async (email: string, password: string, name: string) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const user = await mockRegister(email, password, name);
      localStorage.setItem('capm_user', JSON.stringify(user));
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'REGISTER_ERROR', payload: (error as Error).message });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}