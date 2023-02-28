import "./GoogleMapComponent.scss";
import { FaLocationArrow } from "react-icons/fa";
import { IconContext } from "react-icons";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Autocomplete,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { useWindowSize } from "../utils/utils";
import { convertNumberToArr } from "../utils/utils";

const libraries = ["places"];

export default function GoogleMapComponent() {
  //GET CURRENT WINDOW SIZE
  const currentWindowSize = useWindowSize().width;
  //STATE FOR THE DETAIL INFOR ARR
  const [detailArr, setDetailArr] = useState([]);
  //STATE FOR THE INFOR WINDOW
  const [isWindowOpen, setIsWindowOpen] = useState(true);
  //STATE FOR THE SELECTED MARKER'S INFOR WINDOW
  const [selectedMarker, setSelectedMarker] = useState({
    index: null,
    isOpen: false,
  });
  //STATE FOR AUTOCOMPLETE
  const [autoComplete, setAutoComplete] = useState(null);
  //STATE FOR ZOOM
  const [zoom, setZoom] = useState(2);
  //STATE FOR THE FOUND PLACES
  const [nearPlaces, setNearPlaces] = useState([]);
  //STATE FOR THE MAP
  const [map, setMap] = useState("");
  //STATE FOR THE CURRENT LOCATION
  const [currentLocation, setCurrentLocation] = useState(null);
  //STATE FOR THE INPUT LOCATION
  const [inputAddress, setInputAddress] = useState("");
  //USE USELOAD SCRIPT TO INTEGRATE GOOGLE MAP API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries,
  });
  //FUNCTION TO CONVERT ADDRESS TO COORDINATE
  const coordinateConverter = function (address) {
    //CREATE A NEW GEOCODER
    const geocoder = new window.google.maps.Geocoder();
    //USE GEOCODER TO CONVERT ADDRESS TO COORDINATE
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK") {
        const location = results[0].geometry.location;
        setCurrentLocation({ lat: location.lat(), lng: location.lng() });
      }
    });
  };

  //FUNCTION TO SHOW THE DETAILED INFOR WINDOW OF A PLACE
  //SINCE THE METHOD GETDETAILS IS OPERATED ASYNCHRONOUSLY AND IT DOES NOT HANDLE A PROMISE
  //WE NEED TO DEFINE A PROMISE TO HAULT THE CODE EXECUTION
  const handleShowDetailInfor = async function (index) {
    let newArr = [...detailArr];
    const service = new window.google.maps.places.PlacesService(map);

    const returnValue = await new Promise((resolve, reject) => {
      service.getDetails(
        {
          placeId: nearPlaces[index].place_id,
          fields: ["name", "formatted_address", "photos"],
        },
        (result, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(result);
          } else {
            reject(status);
          }
        }
      );
    });

    let newObj = {
      name: returnValue.name,
      description: returnValue.formatted_address,
      image: returnValue.photos && returnValue.photos[1].getUrl(),
    };
    newArr.splice(index, 1, newObj);
    setDetailArr(newArr);
    setSelectedMarker({ index: index, isOpen: true });
    //SHOW THE INFOR BOX
    // const getAllBoxes = document.querySelectorAll(".map__infor-nearby");
    // console.log(getAllBoxes);
    // getAllBoxes[index].classList.remove(".map__infor-nearby");
  };
  useEffect(() => {
    console.log(detailArr);
  }, [detailArr]);
  //FUNCTION TO SEARCH NEARBY LOCATION BASED ON A PROVIDED LOCATION
  const handleSearchNearbyLocation = function (location) {
    //DEFINE SERVICE BY USING PLACESERVICE PROP
    const service = new window.google.maps.places.PlacesService(map);
    //USE NEARBYSEARCH PROP TO SEARCH NEARBY VETERINARY_CARE
    service.nearbySearch(
      //PROVIDE THE NEEDED INPUT DATA TO SEARCH LOCATIONS
      {
        location: location, //THIS IS THE CENTER LOCATION WHICH IS USED TO SEARCH FOR NEARBY LOCATIONS AROUND IT
        radius: 5000,
        type: "veterinary_care", //SEARCH THE TYPES ON GOOGLE MAP API TYPES OF PLACE
      },
      //RETURN THE FOUND LOCATIONS
      (results, status) => {
        //CHECK IF THE SEARCHING PROCESS IS COMPLETED OR NOT
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          //SET THE PLACES TO THE NEARPLACES STATE
          setNearPlaces(results);
          const newDetailArr = convertNumberToArr(results.length);
          setDetailArr(newDetailArr);
        }
      }
    );
    setIsWindowOpen(true);
  };

  //FUNCTION TO SET THE CURRENT LOCATION STATE BY USING HTML5 GEOLOCATION API
  const handleUpdateCurrentLocationBasedUserLocation = function () {
    if (navigator.geolocation) {
      //GET CURRENT LOCATION FROM THE METHOD GETCURRENTPOSITION
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
      });
    } else {
      alert(
        "Can not access your location to find nearby veterinary health centers"
      );
    }
  };
  //FUNCTION TO UPDATE THE CURRENTLOCATION STATE BASED ON THE INPUT ADDRESS
  const handleUpdateCurrentLocationBasedInput = function () {
    if (inputAddress) {
      coordinateConverter(inputAddress);
      setIsWindowOpen(true);
      setNearPlaces("");
    } else {
      alert("Please input the address");
    }
  };

  //USEEFFECT TO SEARCH NEARBY LOCATIONS WHEN THE CURRENT LOCATION IS AVAILABLE
  useEffect(() => {
    if (currentLocation) {
      setZoom(13);
    }
  });

  //FUNCTION TO CLEAR THE LOCATION
  const clearLocation = function () {
    setCurrentLocation("");
    setInputAddress("");
    nearPlaces("");
  };

  //DEFINE ONMAP LOAD FUNCTION
  const onMapLoad = (map) => {
    //SET THE MAP STATE WHICH IS USED TO RECENTER THE MAP
    setMap(map);
    //SCROLL TO THE TOP OF THE PAGE WHEN THE MAP IS FULLY LOADED (TITLESLOADED)
    //IMPLEMENT ONLY IN THE FIRST TIME THE MAP IS RENDERRED ( USE ADDLISTENERONE AND IMPLEMENT IN ONLOAD PROP)
    //TITLESLOADED IS THE EVENT THAT IS TRIGGERED WHEN THE VISIBLE TITLES OF THE MAP ARE FULLY LOADED
    window.google.maps.event.addListenerOnce(map, "tilesloaded", () => {
      window.scrollTo(0, 0);
    });
  };

  //IF LOADING MAP PROCESS IS ERROR
  if (loadError) {
    return <div>Error Loading Map</div>;
  }

  //IF MAP IS STILL BEING LOADED
  if (!isLoaded) {
    return <div>Loading Map</div>;
  }

  //IF MAP IS COMPLETELY LOADED
  return (
    <div className="map">
      <h1>Search the veterinary health centers near you</h1>
      <GoogleMap
        mapContainerClassName="map__container"
        zoom={zoom}
        center={currentLocation ? currentLocation : { lat: 0, lng: 0 }}
        mapTypeId="roadmap"
        onLoad={onMapLoad}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <div className="map__search-box">
          <Autocomplete
            onLoad={(autocomplete) => {
              setAutoComplete(autocomplete);
            }}
            onPlaceChanged={() => {
              setInputAddress(autoComplete.getPlace().formatted_address);
            }}
          >
            <input
              className="map__input"
              onChange={(event) => {
                setInputAddress(event.target.value);
              }}
              type="text"
            />
          </Autocomplete>
          {/* SUBMIT BUTTON */}
          <button
            onClick={handleUpdateCurrentLocationBasedInput}
            className="App__btn map__btn"
          >
            {currentWindowSize < 501 ? "Submit" : " Submit Your Location"}
          </button>
          {/* BUTTON TO SHOW NEARBY LOCATIONS WHEN THE WINDOW SIZE IS GREATER THAN 960PX
           */}
          {currentLocation && (
            <button
              onClick={() => {
                handleSearchNearbyLocation(currentLocation);
              }}
              className="App__btn map__btn map__btn-nearby"
            >
              Nearby Veterinary Health Center
            </button>
          )}
          {/* BUTTON TO RELLOCATE THE CURRENT LOCATION */}
          {currentLocation && (
            <IconContext.Provider value={{ color: "black", size: "1.5rem" }}>
              {map && (
                <div
                  onClick={() => {
                    map.panTo(currentLocation);
                    setIsWindowOpen(true);
                  }}
                >
                  <FaLocationArrow />
                </div>
              )}
            </IconContext.Provider>
          )}
        </div>
        {/* CURRENT LOCATION */}
        {currentLocation && isWindowOpen && (
          <InfoWindow
            onCloseClick={() => {
              setIsWindowOpen(false);
            }}
            position={currentLocation}
          >
            <p className="map__text">You are here</p>
          </InfoWindow>
        )}
        {/* NEARBY LOCATIONS */}
        {nearPlaces.length > 0 &&
          nearPlaces.map((place, index) => (
            <Marker
              key={place.place_id}
              position={place.geometry.location}
              animation={window.google.maps.Animation.DROP} //GOOGLE IS DEFINED SINCE THE MAP HAS LOADED
              onClick={() => {
                handleShowDetailInfor(index);
              }}
            >
              {detailArr.length > 0 &&
                typeof detailArr[index] !== "number" &&
                index === selectedMarker.index &&
                selectedMarker.isOpen === true && (
                  <InfoWindow
                    onCloseClick={() => {
                      setSelectedMarker({ index: null, isOpen: false });
                    }}
                    position={place.geometry.location}
                  >
                    <div className="map__infor-container" id={index}>
                      <h2>{detailArr[index].name}</h2>
                      <p>
                        <strong>Address:</strong> {detailArr[index].description}
                      </p>
                      <img
                        className="map__infor-image"
                        src={detailArr[index].image}
                        alt="pic"
                      />
                    </div>
                  </InfoWindow>
                )}
            </Marker>
          ))}
        {/* BUTTON SHOWS NEARBY LOCATIONS WHEN THE SCREEN IS LESS THAN 960PX */}
        {currentLocation && (
          <button
            onClick={() => {
              handleSearchNearbyLocation(currentLocation);
            }}
            className="App__btn map__btn-nearby-absolute"
          >
            Show Nearby Veterinary Health Center
          </button>
        )}
      </GoogleMap>
    </div>
  );
}
