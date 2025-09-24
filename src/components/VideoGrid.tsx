"use client";

import { useState, useEffect, useCallback } from "react";
import VideoCard from "@/components/VideoCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from 'use-debounce';
import api from "@/lib/axios";
import { useInView } from 'react-intersection-observer';

export default function VideoGrid() {
  const [videos, setVideos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");

  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% of the loader is visible
  });

  // Main data fetching function
  const fetchVideos = useCallback(async (isNewSearch = false) => {
    const pageToFetch = isNewSearch ? 1 : page;
    
    // Prevent multiple requests from firing at the same time
    if (loading) return;

    setLoading(true);
    
    const params = new URLSearchParams({
      page: pageToFetch.toString(),
      limit: '12',
      sortBy: sortBy,
      sortOrder: 'desc',
    });
    if (debouncedSearchTerm) params.append("query", debouncedSearchTerm);
    if (category !== "All") params.append("category", category);

    try {
      const res = await api.get(`/videos?${params.toString()}`);
      const data = res.data;
      
      if (isNewSearch) {
        // For a new search, completely replace the existing videos
        setVideos(data.videos || []);
      } else {
        // For infinite scroll, append new videos, ensuring no duplicates are added
        setVideos(prev => {
          const existingIds = new Set(prev.map(v => v._id));
          const newVideos = (data.videos || []).filter((video: any) => !existingIds.has(video._id));
          return [...prev, ...newVideos];
        });
      }
      
      setHasNextPage(data.hasNextPage);
      if (data.hasNextPage) {
        setPage(pageToFetch + 1); // Set the page number for the NEXT fetch
      }
    } catch (error) { 
      console.error("Fetch error:", error);
    } finally { 
      setLoading(false); 
    }
  }, [page, debouncedSearchTerm, category, sortBy, loading, hasNextPage]);


  // This useEffect triggers a NEW search when any filter changes.
  useEffect(() => {
    // We pass `true` to indicate this is a new search that should replace existing videos.
    fetchVideos(true);
  }, [debouncedSearchTerm, category, sortBy]);


  // This useEffect triggers the NEXT page fetch for infinite scroll.
  useEffect(() => {
    // Only fetch if the loader is visible, not already loading, and there are more pages.
    // We pass `false` to indicate we are fetching the next page to append.
    if (inView && !loading && hasNextPage) {
      fetchVideos(false);
    }
  }, [inView, loading, hasNextPage, fetchVideos]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row gap-4">
         <Input
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:flex-1"
        />
        <div className="flex gap-4 w-full md:w-auto">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Tech">Tech</SelectItem>
                <SelectItem value="Movie Trailer">Movie Trailers</SelectItem>
                <SelectItem value="Webseries Clips">Webseries</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Hindi Music">Hindi Music</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest First</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video: any) => (
            <VideoCard key={video._id} video={video} />
        ))}
      </div>
      
      {/* This element is the trigger for the infinite scroll */}
      <div ref={ref} className="h-20 flex items-center justify-center">
        {loading && <p className="text-center">Loading more videos...</p>}
        {!loading && !hasNextPage && videos.length > 0 && (
          <p className="text-center text-muted-foreground">You've reached the end!</p>
        )}
        {!loading && videos.length === 0 && (
            <p>No videos found. Try adjusting your search or filters.</p>
        )}
      </div>
    </div>
  );
}