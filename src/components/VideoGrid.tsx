"use client";

import { useState, useEffect, useCallback } from "react";
import VideoCard from "@/components/VideoCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from 'use-debounce'; // 1. Import the debounce tool
import api from "@/lib/axios";

export default function VideoGrid() {
  // --- STATE MANAGEMENT ---
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // 2. This is the debounced value. It will only update 500ms after the user stops typing.
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); 
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  // This function is now wrapped in useCallback for performance
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    
    // 3. THE FIX: We use the DEBOUNCED term for the API call
    if (debouncedSearchTerm) {
      params.append("query", debouncedSearchTerm);
    }
    if (category !== "All") {
      params.append("category", category);
    }
    params.append("sortBy", sortBy);
    params.append("sortOrder", "desc");

    try {
      const res = await api.get(`/videos?${params.toString()}`);
      setVideos(res.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, category, sortBy]); // 4. The dependencies are correct

  // This hook now correctly calls the fetch function whenever a filter changes
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return (
    <div>
      {/* --- FILTER AND SORT CONTROLS --- */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search videos by title or description..."
          // The input updates the 'searchTerm' immediately for a responsive feel
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

      {/* --- VIDEO GRID DISPLAY --- */}
      {loading ? (
        <p>Loading videos...</p>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video: any) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <p>No videos found. Try adjusting your search or filters.</p>
      )}
    </div>
  );
}