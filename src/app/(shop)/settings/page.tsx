'use client';

import { useEffect, useRef, useState } from 'react';
import { User, Shield, Bell, MapPin, CreditCard } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { SecurityTab } from '@/components/settings/SecurityTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { AddressesTab } from '@/components/settings/AddressesTab';
import { PaymentMethodsTab } from '@/components/settings/PaymentMethodsTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const activeButton = tabRefs.current[activeTab];
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto max-w-full overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="w-full max-w-full justify-start overflow-x-auto bg-muted/50 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-20">
          <TabsTrigger
            value="profile"
            className="h-11 shrink-0 gap-2 px-4"
            ref={(el) => {
              tabRefs.current.profile = el;
            }}
          >
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="addresses"
            className="h-11 shrink-0 gap-2 px-4"
            ref={(el) => {
              tabRefs.current.addresses = el;
            }}
          >
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="h-11 shrink-0 gap-2 px-4"
            ref={(el) => {
              tabRefs.current.payments = el;
            }}
          >
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-11 shrink-0 gap-2 px-4"
            ref={(el) => {
              tabRefs.current.security = el;
            }}
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="h-11 shrink-0 gap-2 px-4"
            ref={(el) => {
              tabRefs.current.notifications = el;
            }}
          >
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
