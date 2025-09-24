"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import VideoCard from '@/components/VideoCard'; // We reuse our excellent VideoCard
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingBag, Heart } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // State to hold our data
  const [watchlist, setWatchlist] = useState([]);
  const [orders, setOrders] = useState<any[]>([]); // State now holds the full orders array
  const [loading, setLoading] = useState(true);

  // This effect redirects the user if they are not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error("You must be logged in to view this page.");
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // This effect fetches all necessary data for the page
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          // We fetch the watchlist and orders at the same time for performance
          const [watchlistRes, ordersRes] = await Promise.all([
            api.get('/watchlist'),
            api.get('/orders').catch(() => ({ data: [] })) // Fetch the full orders
          ]);
          setWatchlist(watchlistRes.data.videos || []);
          setOrders(ordersRes.data || []); // Save the full orders array
        } catch (error) {
          toast.error("Could not load your profile data.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // Display a loading message while we check auth and fetch data
  if (isAuthLoading || !user) {
    return <div className="container text-center py-10">Loading profile...</div>;
  }

  // --- THE FIX IS HERE ---
  // This helper now ensures the list of purchased videos is unique
  const allPurchasedVideos = orders.flatMap(order => order.items.map((item: any) => item.videoId)).filter(Boolean);
  const uniquePurchasedVideos = Array.from(new Map(allPurchasedVideos.map(video => [video._id, video])).values());


  return (
    <div className="container mx-auto px-4 py-8">
      {/* --- User Profile Header --- */}
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.username}`} />
          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      {/* --- Stats Section --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos in Watchlist</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{loading ? '...' : watchlist.length}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{loading ? '...' : orders.length}</div></CardContent>
        </Card>
      </div>

      {/* --- Content Tabs --- */}
      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList>
          <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
          {/* The "My Orders" tab is now enabled */}
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="watchlist" className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Saved for Later</h2>
            {loading ? <p>Loading watchlist...</p> : watchlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {watchlist.map((video: any) => (<VideoCard key={video._id} video={video} />))}
              </div>
            ) : <p className="text-muted-foreground">Your watchlist is empty. Save some videos to see them here!</p>}
        </TabsContent>
        {/* --- NEW TAB CONTENT FOR ORDERS --- */}
        <TabsContent value="orders" className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Your Purchase History</h2>
            {loading ? <p>Loading purchases...</p> : uniquePurchasedVideos.length > 0 ? (
              // We now map over the unique list
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {uniquePurchasedVideos.map((video: any) => (<VideoCard key={video._id} video={video} />))}
              </div>
            ) : <p className="text-muted-foreground">You haven't purchased any videos yet.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

