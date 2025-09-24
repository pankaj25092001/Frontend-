import VideoPageClient from "@/components/VideoPageClient";
import { cookies } from 'next/headers';
import axios from 'axios'; // We need axios here for the server-side call

const VideoPage = async ({ params }: { params: { videoId: string } }) => {
  const { videoId } = await params;
  
  // This helper creates a temporary axios instance for server-side fetching
  const createServerApi = async () => {
      // THE FIX: We must 'await' the cookies() function
      const cookieStore = await cookies(); 
      const token = cookieStore.get('accessToken')?.value;
      
      return axios.create({
          baseURL: 'http://localhost:8000/api/v1',
          headers: { Cookie: token ? `accessToken=${token}` : '' }
      });
  };

  try {
    const api = await createServerApi();
    
    // Fetch both the video and the user's watchlist at the same time
    const [videoRes, watchlistRes] = await Promise.all([
        api.get(`/videos/${videoId}`),
        api.get('/watchlist').catch(() => ({ data: { videos: [] } })) // Add a catch so it doesn't fail if the user is logged out
    ]);

    return <VideoPageClient video={videoRes.data} watchlist={watchlistRes.data} />;

  } catch (error) {
    console.error("Fetch error on video page:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Could Not Load Video</h1>
        <p className="text-muted-foreground">The video may not exist, or a server error occurred.</p>
      </div>
    );
  }
};

export default VideoPage;