"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import YouTube from 'react-youtube';

interface VideoPlayerProps {
  youtubeVideoId: string;
}

export default function VideoPlayer({ youtubeVideoId }: VideoPlayerProps) {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <AspectRatio ratio={16 / 9} className="rounded-md overflow-hidden bg-black">
      <YouTube
        videoId={youtubeVideoId}
        opts={opts}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </AspectRatio>
  );
}