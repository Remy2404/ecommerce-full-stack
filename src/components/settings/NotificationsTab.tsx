'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, Smartphone, Globe } from 'lucide-react';

export function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you want to be notified about your orders and account activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Email Notifications
          </h3>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-orders">Order Updates</Label>
                <p className="text-xs text-muted-foreground text-pretty">Receive emails when your order status changes.</p>
              </div>
              <Switch id="email-orders" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-promos">Promotions & Offers</Label>
                <p className="text-xs text-muted-foreground text-pretty">Be the first to know about sales and new arrivals.</p>
              </div>
              <Switch id="email-promos" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            Push Notifications
          </h3>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-delivery">Delivery Alerts</Label>
                <p className="text-xs text-muted-foreground text-pretty">Real-time alerts when your driver is nearby.</p>
              </div>
              <Switch id="push-delivery" defaultChecked />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            System Notifications
          </h3>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-security">Security Alerts</Label>
                <p className="text-xs text-muted-foreground text-pretty">Important notifications about login attempts and security changes.</p>
              </div>
              <Switch id="system-security" defaultChecked disabled />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
