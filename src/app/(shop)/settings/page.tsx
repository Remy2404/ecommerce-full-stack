'use client';

import { useState } from 'react';
import { User, Shield, Bell, Save, UserCircle, Key, Smartphone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setSuccessMessage('Settings updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
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

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <form onSubmit={handleSave}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and how others see you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                      <UserCircle className="h-20 w-20 text-primary/40" />
                    </div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                  </div>
                  <div className="flex-1 grid gap-4 sm:grid-cols-2">
                    <FormField label="First Name">
                      <Input placeholder="John" defaultValue="Ramy" />
                    </FormField>
                    <FormField label="Last Name">
                      <Input placeholder="Doe" />
                    </FormField>
                    <FormField label="Email Address" className="sm:col-span-2">
                      <Input type="email" icon={<Mail className="h-4 w-4" />} placeholder="john@example.com" defaultValue="ramy@example.com" />
                    </FormField>
                    <FormField label="Phone Number" className="sm:col-span-2">
                      <Input type="tel" icon={<Smartphone className="h-4 w-4" />} placeholder="+855 12 345 678" />
                    </FormField>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-border pt-6">
                <p className="text-sm text-success">{successMessage}</p>
                <Button type="submit" isLoading={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <form onSubmit={handleSave}>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 max-w-md">
                  <FormField label="Current Password">
                    <Input type="password" icon={<Key className="h-4 w-4" />} placeholder="••••••••" />
                  </FormField>
                  <FormField label="New Password">
                    <Input type="password" icon={<Key className="h-4 w-4" />} placeholder="••••••••" />
                  </FormField>
                  <FormField label="Confirm New Password">
                    <Input type="password" icon={<Key className="h-4 w-4" />} placeholder="••••••••" />
                  </FormField>
                </div>
                
                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-semibold mb-3">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account.</p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t border-border pt-6">
                <Button type="submit" isLoading={isLoading}>Update Password</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { title: 'Order Updates', desc: 'Get notified about your order status and shipping.' },
                  { title: 'Promotions', desc: 'Receive emails about sales and special offers.' },
                  { title: 'New Arrivals', desc: 'Stay updated when new products are added.' },
                  { title: 'Security Alerts', desc: 'Important notifications about your account security.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-primary flex items-center px-1 cursor-pointer">
                       <div className="h-4 w-4 rounded-full bg-background ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-border pt-6">
              <Button onClick={handleSave} isLoading={isLoading}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
