import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { ProfileClient } from '@/components/profile/profile-client';
import { getUserDashboardStats, getUserOrders } from '@/actions/order.actions';

export const metadata = {
  title: 'My Profile',
  description: 'Manage your account, orders, and wishlist.',
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile');
  }

  // Fetch real data from server actions
  const [statsResult, ordersResult] = await Promise.all([
    getUserDashboardStats(),
    getUserOrders(5), // Limit to 5 most recent
  ]);

  // Fallback for member since if not in database yet (should be after seeding)
  const memberSince = (statsResult.success && statsResult.data) ? statsResult.data.memberSince : 'Recent Member';

  const user = {
    name: session.user.name || 'User',
    email: session.user.email || '',
    image: session.user.image || undefined,
    memberSince: memberSince,
  };

  const stats = {
    orderCount: (statsResult.success && statsResult.data) ? statsResult.data.orderCount : 0,
    points: (statsResult.success && statsResult.data) ? statsResult.data.points : 0,
  };

  const recentOrders = (ordersResult.success && ordersResult.data) ? ordersResult.data : [];

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-20">
      <ProfileClient 
        user={user} 
        stats={stats} 
        recentOrders={recentOrders} 
      />
    </div>
  );
}
