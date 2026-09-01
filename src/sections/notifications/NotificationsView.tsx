'use client';

import React, { useState } from 'react';
import { MOCK_NOTIFICATIONS, NotificationItem } from './_mock';
import NotificationsListView from './NotificationsListView';
import SendNotificationView from './SendNotificationView';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [currentView, setCurrentView] = useState<'list' | 'send'>('list');

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = (newNotification: Omit<NotificationItem, 'id' | 'date'>) => {
    const today = '31/8/2026';
    // Generate simple ID
    const nextId = String(
      notifications.reduce((max, item) => Math.max(max, Number(item.id)), 0) + 1
    );

    const item: NotificationItem = {
      ...newNotification,
      id: nextId,
      date: today,
    };

    // Prepend the new notification to the list
    setNotifications((prev) => [item, ...prev]);
    setCurrentView('list');
  };

  if (currentView === 'send') {
    return (
      <SendNotificationView
        onCancel={() => setCurrentView('list')}
        onSend={handleSend}
      />
    );
  }

  return (
    <NotificationsListView
      data={notifications}
      onDelete={handleDelete}
      onNavigateToSend={() => setCurrentView('send')}
    />
  );
}
