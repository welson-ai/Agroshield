import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * useNotifications hook - Custom hook for accessing notification context
 * Provides methods to manage notifications throughout the app
 * 
 * @returns {NotificationContextType} - Notification context with add/remove/clear methods
 * @throws {Error} - When used outside NotificationProvider
 * 
 * @example
 * const { addNotification, removeNotification } = useNotifications();
 * addNotification({ type: 'success', title: 'Success', message: 'Operation completed' });
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

/**
 * NotificationProvider component - Context provider for notification system
 * Manages toast notifications with auto-dismiss functionality
 * 
 * @param children - React nodes to wrap with notification context
 * @returns JSX.Element - Notification provider with context
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration || 5000
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getNotificationProgress = (notification: Notification) => {
    if (!notification.duration || notification.duration <= 0) return null;
    
    const elapsed = Date.now() - notification.timestamp;
    const progress = Math.max(0, Math.min(100, (elapsed / notification.duration) * 100));
    
    return progress;
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => {
        const progress = getNotificationProgress(notification);
        
        return (
          <div
            key={notification.id}
            className={`
              relative p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out
              ${getNotificationColor(notification.type)}
              ${notification.id === notifications[notifications.length - 1]?.id ? 'translate-x-0' : 'translate-x-full'}
            `}
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div className="flex items-start space-x-3">
              <span className="text-xl flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </span>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-sm opacity-90 mb-2">{notification.message}</p>
                
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex space-x-2 mb-2">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.onClick();
                          removeNotification(notification.id);
                        }}
                        className="px-3 py-1 text-xs font-medium rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-75">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar for auto-dismiss notifications */}
            {progress !== null && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20">
                <div
                  className="h-full bg-current transition-all duration-100"
                  style={{
                    width: `${100 - progress}%`
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Custom hook for easy notification usage
export const useNotificationActions = () => {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'success', title, message, duration });
    },
    error: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'error', title, message, duration: 10000 });
    },
    warning: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'warning', title, message, duration });
    },
    info: (title: string, message: string, duration?: number) => {
      addNotification({ type: 'info', title, message, duration });
    },
    transaction: (title: string, message: string, txHash?: string) => {
      addNotification({
        type: 'info',
        title,
        message,
        duration: 0, // Don't auto-dismiss
        actions: txHash ? [
          {
            label: 'View on CeloScan',
            onClick: () => window.open(`https://celoscan.io/tx/${txHash}`, '_blank')
          }
        ] : undefined
      });
    },
    confirm: (title: string, message: string, onConfirm: () => void) => {
      addNotification({
        type: 'warning',
        title,
        message,
        duration: 0, // Don't auto-dismiss
        actions: [
          {
            label: 'Confirm',
            onClick: onConfirm
          },
          {
            label: 'Cancel',
            onClick: () => {} // Just close the notification
          }
        ]
      });
    }
  };
};

// CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
