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

export default function GoogleMapComponent() {
  //GET CURRENT WINDOW SIZE
  const currentWindowSize = useWindowSize().width;
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
    libraries: ["places"],
  });
  //FUNCTION TO CONVERT ADDRESS TO COORDINATE
  const coordinateConverter = function (address) {
    //CREATE A NEW GEOCODER
    const geocoder = new window.google.maps.Geocoder();
    //USE GEOCODER TO CONVERT ADDRESS TO COORDINATE
    // console.log(address);
    // console.log(inputAddress);
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK") {
        const location = results[0].geometry.location;
        console.log(location);
        setCurrentLocation({ lat: location.lat(), lng: location.lng() });
      }
    });
  };
  //FUNCTION TO SEARCH NEARBY LOCATION BASED ON A PROVIDED LOCATION
  const handleSearchNearbyLocation = function (location) {
    //DEFINE SERVICE BY USING PLACESERVICE METHOD
    const service = new window.google.maps.places.PlacesService(map);
    //USE NEARBYSEARCH METHOD TO SEARCH NEARBY VETERINARY_CARE
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
        }
      }
    );
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
  };
  const divStyle = {
    backgroundColor: "ivory",
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
          <button
            onClick={() => {
              handleUpdateCurrentLocationBasedInput();
            }}
            className="App__btn map__btn"
          >
            {currentWindowSize < 500 ? "Submit" : " Submit Your Location"}
          </button>
          {/* BUTTON TO RELLOCATE THE CURRENT LOCATION */}
          {currentLocation && (
            <IconContext.Provider value={{ color: "black", size: "1.5rem" }}>
              {map && (
                <div
                  onClick={() => {
                    map.panTo(currentLocation);
                  }}
                >
                  <FaLocationArrow />
                </div>
              )}
            </IconContext.Provider>
          )}
        </div>
        {/* CURRENT LOCATION */}
        {currentLocation && (
          <InfoWindow position={currentLocation}>
            <div style={divStyle}>
              <h1 style={{ fontSize: "1rem" }}>Current Location</h1>
            </div>
          </InfoWindow>
        )}
        {/* NEARBY LOCATIONS */}
        {nearPlaces.length > 0 &&
          nearPlaces.map((place) => (
            <Marker
              key={place.place_id}
              position={place.geometry.location}
            ></Marker>
          ))}
      </GoogleMap>
    </div>
  );
}
