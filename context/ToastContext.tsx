import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => removeToast(id), 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`min-w-[300px] p-4 rounded-xl shadow-lg border flex items-center gap-3 ${toast.type === 'success' ? 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-900' :
                                    toast.type === 'error' ? 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-900' :
                                        toast.type === 'warning' ? 'bg-white dark:bg-slate-800 border-yellow-200 dark:border-yellow-900' :
                                            'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900'
                                }`}
                        >
                            <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                    toast.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        toast.type === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
                                {toast.type === 'error' && <AlertOctagon className="h-5 w-5" />}
                                {toast.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                                {toast.type === 'info' && <Info className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-semibold ${toast.type === 'success' ? 'text-green-700 dark:text-green-300' :
                                        toast.type === 'error' ? 'text-red-700 dark:text-red-300' :
                                            toast.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                                                'text-blue-700 dark:text-blue-300'
                                    }`}>
                                    {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{toast.message}</p>
                            </div>
                            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
