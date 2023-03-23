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
import { PushSpinner } from "react-spinners-kit";
import MusicControl from "./components/MusicControl/MusicControl";
import SoundCloudPlayer from "./components/SoundCloudPlayer/SoundCloudPlayer";

//SET UP AOS
Aos.init({ duration: 800 });

//DEFINE LIBRARIES USED IN GOOGLE MAP API
const libraries = ["places"];

function App() {
  //USE USELOAD SCRIPT TO INTEGRATE GOOGLE MAP API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries,
  });
  //GET CURRENT WINDOW SIZE
  const currentWindowSize = useWindowSize().width;
  //USE DISPATCH METHOD TO RUN THE REDUCER FUNCTIONS
  const dispatch = useDispatch();
  //ACCESS THE STATE IN THE SLICE THROUGH USESELECTOR
  const petArr = useSelector((state) => state.pets.value);
  //ACCESS THE THEME REDUCER
  const currentTheme = useSelector((state) => state.theme.value);
  //STATE TO SHOW THE PAGE
  const [showPageClass, setShowPageClass] = useState("");
  //STATE FOR THE VIDEO BACKGROUND
  const [isVideoLoad, setIsVideoLoad] = useState(false);
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
    };
    getImgData();
  }, []);

  //FUNCTION TO UPDATE THE PLAY MUSIC STATE
  const handleUpdatePlayState = function (value) {
    setPlay(value);
  };

  //FUNCTIONS TO UPDATE PET NAME
  const handleUpdatPetName = function (event) {
    setPetName(event.target.value);
  };

  //FUNCTIONS TO UPDATE OWNER NAME
  const handleUpdatOwnerName = function (event) {
    setOwnerName(event.target.value);
  };

  //FUNCTIONS TO CHANGE THE CURRENT OWNER
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

  //FUNCTION TO VALIDATE COLOR THEME
  const isColorValid = function () {
    if (color) {
      return true;
    }
    return false;
  };

  //FUNCTION TO ADD NEW PET ITEM
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

  //IF PET ARRAY LENGTH IS LONGER THAN IMAGE ARRAY, ADD 1 MORE IMAGE
  useEffect(() => {
    const updateImageLinkFunc = async function () {
      if (petArr.length > imgLinkArr.length) {
        const response = await axios.get("https://aws.random.cat/meow");
        const newArr = [...imgLinkArr, response.data.file];
        setImgLinkArr(newArr);
      }
    };
    updateImageLinkFunc();
  }, [petArr, imgLinkArr]);

  //FUNCTION TO DELETE PET ITEM
  const handleDeletePet = function (id) {
    if (petArr.length > 1) {
      dispatch(
        deletePet({
          id: id,
        })
      );
      alert(`The pet and owner with the id ${id} have been deleted`);
    }
    if (petArr.length === 1) {
      alert(`You can not delete all items`);
    }
  };

  //FUNCTION TO UPDATE OWNER FOR A PET
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

  //USEEFFECT TO SET THE UPDATED PET ARRAY TO THE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("petArrLocalStorage", JSON.stringify(petArr));
  }, [petArr]);

  //USEEFFECT TO SET THE UPDATED COLOR THEME TO THE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("themeLocalStorage", currentTheme);
    setColor("");
  }, [currentTheme]);

  //WHEN SCROLLING PAGE, CHECK TO REMOVE DATA-AOS-DELAY ATTRIBUTES FROM ELEMENTS IF ELEMENTS ARE COMPLETELY ANIMATED
  window.onscroll = () => {
    if (
      showPageClass &&
      isLoaded &&
      petArr.length > 0 &&
      imgLinkArr.length > 0
    ) {
      const getItems = document.querySelectorAll(".App__flex-item");
      for (let i = 0; i < getItems.length; i++) {
        if (getItems[i].classList.contains("aos-animate")) {
          getItems[i].removeAttribute("data-aos-delay");
        }
      }
    }
  };

  //CHECK IF THE VIDEO BACKGROUND IS FULLY LOADED
  useEffect(() => {
    if (isLoaded && petArr.length > 0 && imgLinkArr.length > 0) {
      const videoBackground = document.querySelector(".App__video-background");
      videoBackground.addEventListener("loadedmetadata", () => {
        setIsVideoLoad(true);
      });
    }
  });

  //CHECK IF DATA IS FULLY LOADED TO MAKE THE LOADING PAGE DISAPPEAR
  useEffect(() => {
    if (imgLinkArr.length > 0 && isLoaded && isVideoLoad) {
      setTimeout(() => {
        setShowPageClass("App__loading-page-none");
      }, 2000);
    }
  });

  if (isLoaded && petArr.length > 0 && imgLinkArr.length > 0) {
    return (
      <div style={{ color: currentTheme }} className="App">
        {/* LOADING PAGE */}
        <div className={`App__loading-page ${showPageClass}`}>
          <PushSpinner size={100} color="#00ff89" />
        </div>

        {/* VIDEO BACKGROUND */}
        <div className="App__video-color"></div>
        <video
          muted
          autoPlay
          loop
          className="App__video-background"
          src={videoBackground}
        ></video>

        {/* LOAD PAGE WHEN ALL DATA AND VIDEO BACKGROUND ARE FULLY LOADED */}
        {currentWindowSize && showPageClass && (
          <div className="App__cat">
            {/* MUSIC CONTROL BAR */}
            <MusicControl
              currentWindowSize={currentWindowSize}
              handleUpdatePlayState={handleUpdatePlayState}
              play={play}
            />

            {/* SOUNDCLOUD AUDIO PLAYER */}
            <SoundCloudPlayer
              play={play}
              handleUpdatePlayState={handleUpdatePlayState}
            />

            {/* PETS CONTAINER */}
            <div className="App__cat-containers">
              <h1
                data-aos-delay={currentWindowSize > 832 ? "500" : "300"}
                data-aos="fade-up"
                className="App__heading"
              >
                List of pets and owners
              </h1>
              <div></div>

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

              {/* ADD PETS */}
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
                        data-aos-delay={currentWindowSize > 832 ? "450" : "250"}
                        className="App__img"
                        src={imgLinkArr[index]}
                        alt="cat-img"
                      />
                      <div
                        data-aos="fade-up"
                        data-aos-delay={currentWindowSize > 832 ? "500" : "300"}
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
        {showPageClass && (
          <GoogleMapComponent isLoaded={isLoaded} loadError={loadError} />
        )}
      </div>
    );
  }
}

export default App;
