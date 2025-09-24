"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import VideoCard from '@/components/VideoCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingBag, Heart } from 'lucide-react'; // Import icons for stats

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [watchlist, setWatchlist] = useState([]);
  const [orderCount, setOrderCount] = useState(0); // State for order count
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          // Fetch watchlist and orders at the same time
          const [watchlistRes, ordersRes] = await Promise.all([
            api.get('/watchlist'),
            api.get('/orders').catch(() => ({ data: [] })) // Assuming an /orders endpoint
          ]);
          setWatchlist(watchlistRes.data.videos || []);
          setOrderCount(ordersRes.data.length || 0);
        } catch (error) {
          console.error("Failed to fetch profile data", error);
          toast.error("Could not load your profile data.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  if (isAuthLoading || !user) {
    return <div className="container text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* --- NEW User Profile Banner --- */}
      <Card className="overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 h-32 md:h-48" />
        <div className="flex items-end space-x-4 p-4 -mt-16 sm:-mt-20">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
            <AvatarImage src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.username}`} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </Card>
      
      {/* --- NEW Stats Section --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos in Watchlist</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : watchlist.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Purchased Videos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : orderCount}</div>
            </CardContent>
        </Card>
      </div>

      {/* --- Content Tabs (Unchanged) --- */}
      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList>
          <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
          <TabsTrigger value="orders" disabled>My Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="watchlist" className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Saved for Later</h2>
            {loading ? <p>Loading watchlist...</p> : watchlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {watchlist.map((video: any) => (<VideoCard key={video._id} video={video} />))}
              </div>
            ) : <p className="text-muted-foreground">Your watchlist is empty.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}