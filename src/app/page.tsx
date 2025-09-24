import VideoGrid from "@/components/VideoGrid";
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">Welcome to VidStream</h1>
        <p className="text-muted-foreground mt-2">Discover, watch, and share.</p>
      </div>
      <VideoGrid />
    </div>
  );
}