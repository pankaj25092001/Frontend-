"use client";

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext'; // Import the cart context

export default function VideoCard({ video }: { video: any }) {
  const { user } = useAuth();
  const { fetchCart } = useCart(); // Get the function to refresh the cart

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    try {
      await api.post('/cart/add', {
        videoId: video._id,
        purchaseType: 'buy',
      });
      toast.success(`"${video.title}" added to your cart!`);
      fetchCart(); // After adding, tell the cart to refresh itself
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not add to cart.");
    }
  };

  const formatViews = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden group">
      <Link href={`/video/${video._id}`}>
        <CardHeader className="p-0 relative">
          <div className="aspect-video">
            <img src={video.thumbnailUrl} alt={video.title} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
          </div>
          <Badge className="absolute top-2 right-2">Premium</Badge>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-primary">{video.title}</h3>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <span>{formatViews(video.views)} views</span>
        </div>
        <Button size="icon" variant="outline" onClick={handleAddToCart} aria-label="Add to cart">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
