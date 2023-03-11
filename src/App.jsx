import "./App.scss";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { addPet, deletePet, updateOwner } from "./features/Pets";
import { changeTheme } from "./features/ThemeColor";
import GoogleMapComponent from "./components/GoogleMapComponent/GoogleMapComponent";
import axios from "axios";
import { useWindowSize } from "./utils/utils";
import videoBackground from "./assets/videos/background-video.mp4";
import Aos from "aos";
import "aos/dist/aos.css";
import { useLoadScript } from "@react-google-maps/api";
import { PushSpinner, RotateSpinner, WaveSpinner } from "react-spinners-kit";
import ReactPlayer from "react-player";
import { BsPlayCircle, BsPauseCircle } from "react-icons/bs";
import { IconContext } from "react-icons";

Aos.init({ duration: 800 });
const libraries = ["places"];
function App() {
  //USE USELOAD SCRIPT TO INTEGRATE GOOGLE MAP API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries,
  });
  const [showPage, setShowPage] = useState(false);
  //GET CURRENT WINDOW SIZE
  const currentWindowSize = useWindowSize().width;
  //USE DISPATCH METHOD TO RUN THE REDUCER FUNCTIONS
  const dispatch = useDispatch();
  //ACCESS THE STATE IN THE SLICE THROUGH USESELECTOR
  const petArr = useSelector((state) => state.pets.value);
  //ACCESS THE THEME REDUCER
  const currentTheme = useSelector((state) => state.theme.value);
  //STATE FOR THE PET AND OWNER INPUTS
  const [petName, setPetName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  //STATE OF NEW OWNER
  const [newOwner, setNewOwner] = useState("");
  //STATE FOR THE COLOR
  const [color, setColor] = useState("");
  //STATE FOR THE ARRAY OF CAT IMAGE LINKS
  const [imgLinkArr, setImgLinkArr] = useState([]);
  //STATE FOR THE PLAY STATUS
  const [play, setPlay] = useState(false);
  //USE EFFECT TO GET CAT PICTURES
  useEffect(() => {
    const getImgData = async function () {
      //GET THE NUMBER OF IMAGES THAT EQUALS TO THE LENGTH OF THE PET ARRAY
      const arrLength = petArr.length;
      const newArr = [];
      for (let i = 1; i <= arrLength; i++) {
        //GET DATA FROM CAT REST API
        const response = await axios.get("https://aws.random.cat/meow");
        newArr.push(response.data.file);
      }
      setImgLinkArr(newArr);
      setTimeout(() => {
        setShowPage(true);
      }, 2000);
    };
    getImgData();
  }, [petArr]);
  //FUNCTIONS TO UPDATE PET AND OWNER NAMES
  const handleUpdatPetName = function (event) {
    setPetName(event.target.value);
  };
  const handleUpdatOwnerName = function (event) {
    setOwnerName(event.target.value);
  };
  //FUNCTIONS TO UPDATE NEW OWNER
  const handleUpdateNewOwner = function (event) {
    setNewOwner(event.target.value);
  };
  //FUNCTION TO VALIDATE PETNAME AND OWNER NAME
  const isPetAndOwnerValid = function () {
    if (petName && ownerName) {
      return true;
    }
    return false;
  };
  //FUNCTION TO VALIDATE COLOR
  const isColorValid = function () {
    if (color) {
      return true;
    }
    return false;
  };
  //FUNCTION TO ADD PET
  const handleAddPet = function () {
    if (isPetAndOwnerValid()) {
      const id = petArr[petArr.length - 1].id + 1;
      dispatch(
        addPet({
          id: id,
          name: petName,
          owner: ownerName,
        })
      );
      alert(`The new pet and owner with id ${id} have been added`);
    } else {
      alert("Please input both pet name and owner name!");
    }
    setPetName("");
    setOwnerName("");
  };
  //FUNCTION TO DELETE PET
  const handleDeletePet = function (id) {
    dispatch(
      deletePet({
        id: id,
      })
    );
    alert(`The pet and owner with the id ${id} have been deleted`);
  };
  //FUNCTION TO UPDATE OWNER
  const handleSetNewOwner = function (id) {
    if (newOwner) {
      dispatch(
        updateOwner({
          id: id,
          owner: newOwner,
        })
      );
    } else {
      alert("Please insert a new owner");
    }
  };
  //USEEFFECT TO SET THE UPDATED PETARR TO THE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("petArrLocalStorage", JSON.stringify(petArr));
  }, [petArr]);
  //USEEFFECT TO SET THE UPDATED THEME TO THE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("themeLocalStorage", currentTheme);
    setColor("");
  }, [currentTheme]);

  //USEEFFECT TO REMOVE DATA-AOS-DELAY ATTRIBUTES FROM ELEMENTS IF ELEMENTS ARE COMPLETELY ANIMATED
  useEffect(() => {
    if (showPage && isLoaded && petArr.length > 0 && imgLinkArr.length > 0) {
      const getItems = document.querySelectorAll(".App__flex-item");
      for (let i = 0; i < getItems.length; i++) {
        if (getItems[i].classList.contains("aos-animate")) {
          getItems[i].removeAttribute("data-aos-delay");
        }
      }
    }
  }, [showPage, isLoaded, petArr, imgLinkArr]);

  //WHEN SCROLLING PAGE, CHECK TO REMOVE DATA-AOS-DELAY ATTRIBUTES FROM ELEMENTS IF ELEMENTS ARE COMPLETELY ANIMATED
  window.onscroll = () => {
    if (showPage && isLoaded && petArr.length > 0 && imgLinkArr.length > 0) {
      const getItems = document.querySelectorAll(".App__flex-item");
      for (let i = 0; i < getItems.length; i++) {
        if (getItems[i].classList.contains("aos-animate")) {
          getItems[i].removeAttribute("data-aos-delay");
        }
      }
    }
  };

  const [musicLoading, setMusicLoading] = useState(false);

  //LOADING PAGE
  if (
    !showPage ||
    !isLoaded ||
    petArr.length === 0 ||
    imgLinkArr.length === 0
  ) {
    return (
      <div className="App__loading-page">
        <PushSpinner size={100} color="#00ff89" />
      </div>
    );
  }

  //SHOWING PAGE
  if (showPage && isLoaded && petArr.length > 0 && imgLinkArr.length > 0) {
    return (
      <div>
        <div className="App__loading-page-disappear">
          <PushSpinner size={100} color="#00ff89" />
        </div>
        <div style={{ color: currentTheme }} className="App">
          {currentWindowSize && (
            <div className="App__cat">
              <div className="App__music-playing">
                <WaveSpinner size={currentWindowSize > 832 ? 33 : 22} />
              </div>
              <div
                className="App__music"
                data-aos="fade"
                data-aos-delay={currentWindowSize > 832 ? "700" : "500"}
              >
                <p className="App__music-text">Music</p>
                {!play && (
                  <div
                    className="App__music-icon"
                    onClick={() => {
                      const audioContext = new AudioContext();
                      audioContext.resume();
                      setPlay(true);
                      setMusicLoading(true);
                      setTimeout(() => {
                        setMusicLoading(false);
                      }, 3000);
                    }}
                  >
                    <IconContext.Provider
                      value={{ color: "black", size: "100%" }}
                    >
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
                    className="App__music-icon"
                    onClick={() => {
                      const audioContext = new AudioContext();
                      audioContext.resume();
                      setPlay(false);
                    }}
                  >
                    <IconContext.Provider
                      value={{ color: "black", size: "100%" }}
                    >
                      <BsPauseCircle />
                    </IconContext.Provider>
                  </div>
                )}
              </div>
              {play && (
                <ReactPlayer
                  url={
                    "https://soundcloud.com/user-595317454/home-day-time-theme-tsuki?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
                  }
                  playing={true}
                  className="App__audio"
                  onEnded={() => {
                    setPlay(false);
                    setTimeout(() => {
                      setPlay(true);
                    }, 2000);
                  }}
                />
              )}
              <div className="App__video-color"></div>
              <video
                muted
                autoPlay
                loop
                className="App__video-background"
                src={videoBackground}
              ></video>
              <div className="App__cat-containers">
                <h1
                  data-aos-delay={currentWindowSize > 832 ? "500" : "300"}
                  data-aos="fade-up"
                  className="App__heading"
                >
                  List of pets and owners
                </h1>

                {/* CHANGE COLOR THEME */}
                <div
                  data-aos="slide-left"
                  data-aos-delay={currentWindowSize > 832 ? "600" : "400"}
                  className="App__color-theme-wrapper"
                >
                  <input
                    value={color}
                    onChange={(event) => {
                      setColor(event.target.value);
                    }}
                    type="text"
                    placeholder="Input color here..."
                  />
                  <button
                    className="App__btn"
                    style={{ backgroundColor: currentTheme }}
                    onClick={() => {
                      if (isColorValid()) {
                        dispatch(changeTheme(color));
                        alert(`Color theme has been changed to ${color}`);
                      } else {
                        alert("Please input the color!");
                      }
                    }}
                  >
                    {currentWindowSize < 500
                      ? "Change Color"
                      : "Change Color Theme"}
                  </button>
                  {/* BUTTON TO RESET DATA STORAGE */}
                  <button
                    className="App__btn"
                    style={{ backgroundColor: currentTheme }}
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload(); //USE THIS TO RELOAD THE CURRENT PAGE
                    }}
                  >
                    Reset local storage
                  </button>
                </div>

                {/* ADD PET */}
                <div
                  data-aos="slide-right"
                  data-aos-delay={currentWindowSize > 832 ? "700" : "500"}
                  className="App__add-pet-wrapper"
                >
                  <input
                    value={petName}
                    onChange={handleUpdatPetName}
                    type="text"
                    placeholder="pet name..."
                  />
                  <input
                    value={ownerName}
                    onChange={handleUpdatOwnerName}
                    type="text"
                    placeholder="owner name..."
                  />
                  <button
                    className="App__btn"
                    style={{ backgroundColor: currentTheme }}
                    onClick={handleAddPet}
                  >
                    Add pet
                  </button>
                </div>
                {/* RENDER PETS */}
                <div className="App__flex-container">
                  {petArr.length > 0 &&
                    imgLinkArr.length > 0 &&
                    petArr.map((pet, index) => (
                      <div
                        data-aos="fade"
                        data-aos-delay={currentWindowSize > 832 ? "400" : "200"}
                        className="App__flex-item"
                        key={pet.id}
                      >
                        <img
                          data-aos="fade"
                          data-aos-delay={
                            currentWindowSize > 832 ? "450" : "250"
                          }
                          className="App__img"
                          src={imgLinkArr[index]}
                          alt="cat-img"
                        />

                        <div
                          data-aos="fade-up"
                          data-aos-delay={
                            currentWindowSize > 832 ? "500" : "300"
                          }
                          className="App__pet-owner-infor"
                        >
                          <p>
                            <strong>Pet name:</strong> {pet.name}
                          </p>
                          <p>
                            {" "}
                            <strong>Owner name:</strong> {pet.owner}
                          </p>
                          <input
                            onChange={handleUpdateNewOwner}
                            type="text"
                            placeholder="New owner..."
                            id="new-owner-input"
                            className="App__input-pet"
                          />
                          <button
                            className="App__btn App__btn-pet"
                            style={{ backgroundColor: currentTheme }}
                            onClick={() => {
                              handleSetNewOwner(pet.id);
                              document.getElementById("new-owner-input").value =
                                "";
                            }}
                          >
                            Add new owner
                          </button>
                          <button
                            className="App__btn App__btn-pet"
                            style={{ backgroundColor: currentTheme }}
                            onClick={() => {
                              handleDeletePet(pet.id);
                            }}
                          >
                            Delete pet
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          {/* GOOGLE MAP */}
          <GoogleMapComponent isLoaded={isLoaded} loadError={loadError} />
        </div>
      </div>
    );
  }
}

export default App;
