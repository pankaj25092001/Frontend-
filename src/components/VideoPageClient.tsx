// src/components/VideoPageClient.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Bookmark } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function VideoPageClient({ video: initialVideo, watchlist: initialWatchlist }: { video: any, watchlist: any }) {
  const { user } = useAuth();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialVideo.likes.length);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLiked(initialVideo.likes.includes(user._id));
      setIsInWatchlist(initialWatchlist.videos.some((v: any) => v._id === initialVideo._id));
    }
  }, [user, initialVideo, initialWatchlist]);

  const handleToggleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like a video.");
      return;
    }
    
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    // THE FIX IS HERE: We explicitly tell TypeScript the type of 'prev'.
    setIsLiked(prev => !prev);
    setLikeCount((prev: number) => (originalIsLiked ? prev - 1 : prev + 1));

    try {
      await api.post(`/videos/${initialVideo._id}/toggle-like`);
    } catch (error) {
      toast.error("Failed to update like status.");
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      toast.error("You must be logged in to use the watchlist.");
      return;
    }
    const originalIsInWatchlist = isInWatchlist;
    setIsInWatchlist(prev => !prev);
    try {
      await api.post('/watchlist/toggle', { videoId: initialVideo._id });
      toast.success(originalIsInWatchlist ? "Removed from watchlist" : "Added to watchlist");
    } catch (error) {
      toast.error("Failed to update watchlist.");
      setIsInWatchlist(originalIsInWatchlist);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <VideoPlayer youtubeVideoId={initialVideo.youtubeVideoId} />
      <div className="space-y-4 mt-6">
        <h1 className="text-3xl font-bold">{initialVideo.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <Badge>{initialVideo.category}</Badge>
            <div className="flex items-center gap-2"><Eye className="w-5 h-5" /><span>{initialVideo.views.toLocaleString()} views</span></div>
            <span>{new Date(initialVideo.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleToggleLike}>
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {likeCount.toLocaleString()}
            </Button>
            <Button variant="outline" onClick={handleToggleWatchlist}>
              <Bookmark className={`mr-2 h-4 w-4 ${isInWatchlist ? 'fill-white' : ''}`} />
              {isInWatchlist ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{initialVideo.description}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}