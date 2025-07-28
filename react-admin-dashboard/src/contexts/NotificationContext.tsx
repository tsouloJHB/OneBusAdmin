import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { NotificationState } from '../types';

// Extended notification type for internal use
interface Notification extends NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoHide: boolean;
  duration: number;
}

// Context type
interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    message: string,
    type?: 'success' | 'error' | 'warning' | 'info',
    options?: {
      autoHide?: boolean;
      duration?: number;
    }
  ) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Action types
type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' };

// Initial state
const initialState: Notification[] = [];

// Reducer
const notificationReducer = (
  state: Notification[],
  action: NotificationAction
): Notification[] => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, action.payload];
    case 'REMOVE_NOTIFICATION':
      return state.filter(notification => notification.id !== action.payload);
    case 'CLEAR_ALL_NOTIFICATIONS':
      return [];
    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, initialState);

  // Generate unique ID for notifications
  const generateId = (): string => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Show notification function
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options: {
      autoHide?: boolean;
      duration?: number;
    } = {}
  ): void => {
    const {
      autoHide = true,
      duration = type === 'error' ? 6000 : 4000, // Error messages stay longer
    } = options;

    const notification: Notification = {
      id: generateId(),
      type,
      message,
      autoHide,
      duration,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Auto-hide notification if enabled
    if (autoHide) {
      setTimeout(() => {
        hideNotification(notification.id);
      }, duration);
    }
  };

  // Hide notification function
  const hideNotification = (id: string): void => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  // Clear all notifications function
  const clearAllNotifications = (): void => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  const contextValue: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;