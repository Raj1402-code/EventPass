'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface TabOption {
  id: string;
  label: string;
  badge?: string;
}

export interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={clsx('flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006D77]',
              isActive
                ? 'bg-white dark:bg-gray-900 text-[#006D77] dark:text-[#83C5BE] shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
            role="tab"
            aria-selected={isActive}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={clsx(
                  'ml-2 px-2 py-0.5 text-xs rounded-full font-medium',
                  isActive
                    ? 'bg-[#006D77]/10 text-[#006D77]'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
