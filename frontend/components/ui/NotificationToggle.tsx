'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Feedback';

export function NotificationToggle() {
  const { notify } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);
  const [warrantyAlerts, setWarrantyAlerts] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotification = async () => {
    if (!supported) {
      notify('Web notifications are not supported in this browser.', 'warning');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        notify('Push alerts activated! You will receive milestone updates.', 'success');
        // Send a test welcome notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'NOTIFICATION_TEST',
            title: 'RoofToGrid Alerts Active ☀️',
            body: 'You will receive real-time updates when your installer finishes milestones.',
          });
        } else {
          new Notification('RoofToGrid Alerts Active ☀️', {
            body: 'You will receive real-time updates when your installer finishes milestones.',
            icon: '/icon.png',
          });
        }
      } else {
        notify('Notification permission was declined.', 'warning');
      }
    } catch {
      notify('Could not enable notifications.', 'error');
    }
  };

  return (
    <Card>
      <CardHeader
        title="Push Notifications & Project Alerts"
        description="Receive instant alerts on your device when your installer logs milestone completions or when warranties need attention."
      />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Browser Push Status:{' '}
                <span className="font-normal capitalize text-slate-600">{permission}</span>
              </p>
              <p className="text-xs text-slate-500">
                {permission === 'granted'
                  ? 'Real-time alerts active on this device'
                  : 'Grant browser permission to receive background updates'}
              </p>
            </div>
          </div>

          <div>
            {permission === 'granted' ? (
              <Badge tone="good">Enabled</Badge>
            ) : (
              <Button size="sm" variant="secondary" onClick={requestNotification}>
                Enable Notifications
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={milestoneAlerts}
              onChange={(e) => setMilestoneAlerts(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Alert me when DISCOM application or net-metering stages are updated</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={warrantyAlerts}
              onChange={(e) => setWarrantyAlerts(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Alert me 30 days before inverter or workmanship warranties expire</span>
          </label>
        </div>
      </CardBody>
    </Card>
  );
}
