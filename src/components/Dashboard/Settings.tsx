
import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, User } from 'lucide-react';
import Button from '../../../components/Button';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary dark:text-blue-400" />
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account preferences and security.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <User className="h-5 w-5 text-slate-400" />
             Profile Information
           </h2>
        </div>
        <div className="p-6 space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
               <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" defaultValue="Dr. Ahmed Hassan" disabled />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
               <input type="email" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" defaultValue="ahmed@bis.edu.eg" disabled />
             </div>
           </div>
           <div className="pt-2">
              <Button variant="outline" size="sm" disabled>Edit Profile (Coming Soon)</Button>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Bell className="h-5 w-5 text-slate-400" />
             Notifications
           </h2>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex items-center justify-between">
              <div>
                 <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                 <p className="text-sm text-slate-500">Receive summaries of graded exams.</p>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
