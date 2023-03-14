import "./SoundCloudPlayer.scss";
import ReactPlayer from "react-player";

export default function SoundCloudPlayer({ play, handleUpdatePlayState }) {
  return (
    <div>
      {play && (
        <ReactPlayer
          url={
            "https://soundcloud.com/user-595317454/home-day-time-theme-tsuki?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
          }
          playing={play}
          className="soundcloud-audio"
          onEnded={() => {
            handleUpdatePlayState(false);
            setTimeout(() => {
              handleUpdatePlayState(true);
            }, 2000);
          }}
        />
      )}
    </div>
  );
}
