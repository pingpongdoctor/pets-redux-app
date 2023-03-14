import "./MusicControl.scss";
import { BsPlayCircle, BsPauseCircle } from "react-icons/bs";
import { RotateSpinner, WaveSpinner } from "react-spinners-kit";
import { IconContext } from "react-icons";
import { useState } from "react";
import Aos from "aos";

//SET UP AOS
Aos.init({ duration: 800 });
export default function MusicControl({
  currentWindowSize,
  handleUpdatePlayState,
  play,
}) {
  //STATE TO LOAD MUSIC PLAYER
  const [musicLoading, setMusicLoading] = useState(false);
  return (
    <div
      className="music-control"
      data-aos="fade"
      data-aos-delay={currentWindowSize > 832 ? "700" : "500"}
    >
      <div className="music-control__playing-background">
        <WaveSpinner
          color="#00ff885a"
          size={currentWindowSize > 832 ? 33 : 22}
        />
      </div>
      <p className="music-control__text">Music</p>
      {!play && (
        <div
          className="music-control__icon"
          onClick={() => {
            // CREATE A NEW AUDIOCONTEXT AND RESUME IT EACH TIME THE MUSIC IS PLAYED
            const audioContext = new AudioContext();
            audioContext.resume();
            handleUpdatePlayState(true);
            setMusicLoading(true);
            setTimeout(() => {
              setMusicLoading(false);
            }, 3000);
          }}
        >
          <IconContext.Provider value={{ color: "black", size: "100%" }}>
            <BsPlayCircle />
          </IconContext.Provider>
        </div>
      )}
      {play && musicLoading && (
        <div>
          <RotateSpinner
            size={currentWindowSize > 832 ? 38 : 30}
            color="#00ff89"
          />
        </div>
      )}
      {play && (
        <div
          className="music-control__icon"
          onClick={() => {
            const audioContext = new AudioContext();
            audioContext.resume();
            handleUpdatePlayState(false);
          }}
        >
          <IconContext.Provider value={{ color: "black", size: "100%" }}>
            <BsPauseCircle />
          </IconContext.Provider>
        </div>
      )}
    </div>
  );
}
