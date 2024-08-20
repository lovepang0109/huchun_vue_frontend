import { getYouTube, embedVideo as embedVideos } from "@/lib/helpers";
import { useState, useEffect, useMemo } from "react";

interface props {
  _link: string;
  _height: number;
  watchedDuration?: any;
}

let loadYT: any;

const VideoPlayer = ({ _link, _height, watchedDuration }: props) => {
  const playerId = Date.now();
  const youtubeCode = useMemo(() => getYouTube(_link), [_link]);
  const embedVideo = useMemo(() => embedVideos(_link), [_link]);
  const [height, setHeight] = useState<number>(_height);
  const [player, setPlayer] = useState<any>();
  const [timeSpent, setTimeSpent] = useState<any>([]);
  const [timer, setTimer] = useState<any>();
  const [percent, setPercent] = useState<number>(0);

  const link = useMemo(() => {
    if (_height) {
      setHeight(400);
    }
  }, [_link]);

  useEffect(() => {
    if (!loadYT) {
      loadYT = new Promise((resolve) => {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag: any = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      });
    }
    loadYT.then((YT: any) => {
      setPlayer(
        new YT.Player(`player-${playerId}`, {
          height: height,
          width: "100%",
          videoId: youtubeCode,
          events: {
            onReady: (e: any) => onPlayerReady(e),
            onStateChange: (e: any) => onPlayerStateChange(e),
          },
          playerVars: {
            playsinline: 1,
            autoplay: 0,
            controls: 1,
            modestbranding: 0,
            rel: 0,
            showInfo: 0,
          },
        })
      );
    });
  }, []);

  const onPlayerReady = (e: any) => {};

  const onPlayerStateChange = (event: any) => {
    if (event.data === 1) {
      // Started playing
      let time_spent = timeSpent;
      if (!time_spent.length) {
        // create any array of seconds (getDuration return video duration in seconds)
        for (let i = 0, l = parseInt(player.getDuration()); i < l; i++) {
          time_spent.push(false);
        }
      }
      setTimeSpent(time_spent);
      setTimer(setInterval(() => record(time_spent), 500));
    } else {
      clearInterval(timer);
    }
  };

  const record = (_timeSpent: any) => {
    _timeSpent[parseInt(player.getCurrentTime())] = true;
    setTimeSpent(_timeSpent);
    showPercentage();
  };

  const showPercentage = () => {
    let seconds = 0;
    for (let i = 0, l = timeSpent.length; i < l; i++) {
      if (timeSpent[i]) {
        seconds++;
      }
    }
    setPercent(Math.round((seconds / timeSpent.length) * 100));
    watchedDuration({ seconds: seconds });
  };

  return (
    <>
      {youtubeCode && <div id={`player-${playerId}`}></div>}
      {/* {!youtubeCode &&  */}
      {embedVideo && (
        <iframe
          id="player"
          title="course videos"
          className="w-100"
          height={height}
          style={{ height: `${height}px, !important` }}
          src={embedVideo}
          frameBorder="0"
          allowFullScreen
          // enablejsapi="true"
        ></iframe>
      )}
      {!embedVideo && (
        <figure>
          <img src="/assets/images/v-img.png" alt="" />
        </figure>
      )}
    </>
  );
};

export default VideoPlayer;
