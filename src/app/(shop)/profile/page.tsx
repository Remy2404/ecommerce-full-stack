'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';
import { ProfileClient } from '@/components/profile/profile-client';
import { getUserDashboardStats, getUserOrders } from '@/actions/order.actions';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState({ orderCount: 0, points: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/profile');
      return;
    }

    async function fetchData() {
      if (!isAuthenticated) return;
      
      try {
        const [statsResult, ordersResult] = await Promise.all([
          getUserDashboardStats(),
          getUserOrders(5),
        ]);

        if (statsResult.success && statsResult.data) {
          setStats({
            orderCount: statsResult.data.orderCount || 0,
            points: statsResult.data.points || 0,
          });
        }

        if (ordersResult.success && ordersResult.data) {
          setRecentOrders(ordersResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setDataLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 lg:pt-20 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const profileUser = {
    name: user.name,
    email: user.email,
    image: user.avatarUrl || undefined,
    memberSince: 'Member',
  };

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-20">
      <ProfileClient 
        user={profileUser} 
        stats={stats} 
        recentOrders={recentOrders} 
      />
    </div>
  );
}
