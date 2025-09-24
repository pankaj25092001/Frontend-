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
import { ShoppingBag, Heart } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [watchlist, setWatchlist] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
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
          // For now, we'll just fetch the watchlist. We can add an /orders endpoint later.
          const watchlistRes = await api.get('/watchlist');
          setWatchlist(watchlistRes.data.videos || []);
          // setOrderCount(ordersRes.data.length || 0); // Placeholder for future
        } catch (error) {
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
      {/* --- NEW User Profile Banner with Gradient --- */}
      <Card className="overflow-hidden mb-8 border-2 border-primary/20">
        <div className="bg-gradient-to-r from-primary/10 to-background h-32 md:h-48" />
        <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 p-4 -mt-16 sm:-mt-20">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background ring-2 ring-primary">
            <AvatarImage src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.username}`} />
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="pb-2 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </Card>
      
      {/* --- NEW Stats Section with Hover Effect --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos in Watchlist</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{loading ? '...' : watchlist.length}</div></CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Purchased Videos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{loading ? '...' : orderCount}</div></CardContent>
        </Card>
      </div>

      {/* --- Content Tabs --- */}
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

