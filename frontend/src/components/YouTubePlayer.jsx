import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

let apiLoadingPromise = null;

function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve();

  if (!apiLoadingPromise) {
    apiLoadingPromise = new Promise((resolve) => {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = resolve;
    });
  }
  return apiLoadingPromise;
}

const YouTubePlayer = forwardRef(function YouTubePlayer({ videoId, onReady }, ref) {
  const containerId = useRef(`yt-player-${Math.random().toString(36).slice(2)}`);
  const playerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeAPI().then(() => {
      if (cancelled) return;
      playerRef.current = new window.YT.Player(containerId.current, {
        videoId: videoId || undefined,
        playerVars: { controls: 0, disablekb: 0, rel: 1},
        events: {
          onReady: () => onReady?.(),
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
    };
   
  }, []);

  useImperativeHandle(ref, () => ({
    playVideo: () => playerRef.current?.playVideo(),
    pauseVideo: () => playerRef.current?.pauseVideo(),
    seekTo: (seconds) => playerRef.current?.seekTo(seconds, true),
    getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
    getDuration: () => playerRef.current?.getDuration() || 0,
    loadVideoById: (id) => playerRef.current?.loadVideoById(id),
  }));

  return (
    <div className="player-frame">
      <div id={containerId.current} />
    </div>
  );
});

export default YouTubePlayer;
