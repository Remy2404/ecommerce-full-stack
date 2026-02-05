'use client';

import { User, Shield, Bell, MapPin, CreditCard } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { SecurityTab } from '@/components/settings/SecurityTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { AddressesTab } from '@/components/settings/AddressesTab';
import { PaymentMethodsTab } from '@/components/settings/PaymentMethodsTab';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-muted/50 flex flex-wrap">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="addresses">
          <AddressesTab />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentMethodsTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
