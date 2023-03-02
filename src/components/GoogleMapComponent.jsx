import "./GoogleMapComponent.scss";
import { FaLocationArrow } from "react-icons/fa";
import { IconContext } from "react-icons";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { useWindowSize } from "../utils/utils";
import { convertNumberToArr } from "../utils/utils";
import { useSelector } from "react-redux";
import Aos from "aos";
import "aos/dist/aos.css";
Aos.init();

const libraries = ["places"];

export default function GoogleMapComponent() {
  //ACCESS THE THEME REDUCER
  const currentTheme = useSelector((state) => state.theme.value);
  //GET CURRENT WINDOW SIZE
  const currentWindowSize = useWindowSize().width;
  //STATE FOR DIRECTION INFOR
  const [direction, setDirection] = useState(null);
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
  const converteCoordinateAndUpdateState = function (address) {
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
    //CREATE A PROMISE
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
      image: returnValue.photos && returnValue.photos[0].getUrl(),
    };

    newArr.splice(index, 1, newObj);
    setDetailArr(newArr);
    setSelectedMarker({ index: index, isOpen: true });
  };

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
      converteCoordinateAndUpdateState(inputAddress);
      setIsWindowOpen(true);
      setNearPlaces("");
    } else {
      alert("Please input the address");
    }
  };

  //FUNCTION TO HANDLE IMPLEMENT ROUTES
  const handleRoute = async function (destination, method) {
    //USE DIRECTION SERVICE METHOD FROM GOOGLE MAP API
    const directionService = new window.google.maps.DirectionsService();
    //GET USE ROUTE MEHOD TO DESIGN ROUTES
    //BECAUSE DIRECTIONSERVICE METHOD HANDLE A PROMISE SO THAT WE CAN USE THE AWAIT KEYWORD
    await directionService.route(
      {
        origin: currentLocation,
        destination: destination,
        travelMode:
          method === "driving"
            ? window.google.maps.TravelMode.DRIVING
            : window.google.maps.TravelMode.TRANSIT,
      },
      (results, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirection({
            response: results,
            duration: results.routes[0].legs[0].distance.text,
            distance: results.routes[0].legs[0].duration.text,
          });
        }
      }
    );
  };

  //USEEFFECT TO SEARCH NEARBY LOCATIONS WHEN THE CURRENT LOCATION IS AVAILABLE
  useEffect(() => {
    if (currentLocation) {
      setZoom(12);
    }
  });

  //DEFINE THE STYLE OBJECT FOR DIRECTION BUTTON
  const btnStyle = {
    backgroundColor: currentTheme,
    color: "white",
    borderRadius: "5px",
    border: "none",
    padding: "1rem",
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
      {currentWindowSize && (
        <div className="map__big-container">
          <h1
            data-aos="fade-up"
            data-aos-duration={currentWindowSize > 832 ? "700" : "400"}
            data-aos-delay={currentWindowSize > 832 ? "600" : "400"}
            className="map__heading"
          >
            Search nearby veterinary health centers
          </h1>
          <div
            data-aos="fade-up"
            data-aos-duration={currentWindowSize > 832 ? "700" : "400"}
            data-aos-delay={currentWindowSize > 832 ? "600" : "400"}
          >
            <GoogleMap
              mapContainerClassName="map__element"
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
              {/* AUTOCOMPLETE BOX */}
              <div className="map__search-box">
                <div className="map__big-wrapper">
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      setAutoComplete(autocomplete);
                    }}
                    onPlaceChanged={() => {
                      setInputAddress(
                        autoComplete.getPlace().formatted_address
                      );
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
                    onClick={() => {
                      handleUpdateCurrentLocationBasedInput();
                      setDirection(null);
                      setZoom(12);
                    }}
                    className="App__btn map__btn"
                    style={{ backgroundColor: currentTheme }}
                  >
                    {currentWindowSize < 501
                      ? "Submit"
                      : " Submit Your Location"}
                  </button>
                  {/* BUTTON TO SHOW NEARBY LOCATIONS WHEN THE WINDOW SIZE IS GREATER THAN 960PX
                   */}
                  {currentLocation && (
                    <button
                      onClick={() => {
                        handleSearchNearbyLocation(currentLocation);
                        setDirection(null);
                        setZoom(12);
                      }}
                      className="App__btn map__btn map__btn-nearby"
                      style={{ backgroundColor: currentTheme }}
                    >
                      Nearby Veterinary Health Center
                    </button>
                  )}
                  {/* BUTTON TO RELLOCATE THE CURRENT LOCATION */}
                  {currentLocation && (
                    <IconContext.Provider
                      value={{ color: "black", size: "1.5rem" }}
                    >
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
                {/* SHOW DURATION AND DISTANCE */}
                {direction && direction.duration && direction.distance && (
                  <div className="map__dis-dur">
                    <p>Distance: {direction.distance};</p>
                    <p>Duration: {direction.duration}</p>
                  </div>
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
                      map.panTo(place.geometry.location);
                    }}
                  >
                    {/* INFORWINDOWS OF NEARBY LOCATIONS */}
                    {detailArr.length > 0 &&
                      typeof detailArr[index] !== "number" &&
                      index === selectedMarker.index &&
                      selectedMarker.isOpen === true && (
                        <InfoWindow
                          onCloseClick={() => {
                            setSelectedMarker({ index: null, isOpen: false });
                          }}
                          position={place.geometry.location}
                          zIndex={10}
                        >
                          <div className="map__infor-container" id={index}>
                            {detailArr[index].image && (
                              <img
                                className="map__infor-image"
                                src={detailArr[index].image}
                                alt="pic"
                              />
                            )}
                            <h2>{detailArr[index].name}</h2>
                            <p>
                              <strong>Address:</strong>{" "}
                              {detailArr[index].description}
                            </p>
                            <button
                              onClick={() => {
                                handleRoute(place.geometry.location, "transit");
                                setSelectedMarker({
                                  index: null,
                                  isOpen: false,
                                });
                                setIsWindowOpen(true);
                              }}
                              style={btnStyle}
                            >
                              Transit to this place
                            </button>
                            <button
                              onClick={() => {
                                handleRoute(place.geometry.location, "driving");
                                setSelectedMarker({
                                  index: null,
                                  isOpen: false,
                                });
                                setIsWindowOpen(true);
                              }}
                              style={btnStyle}
                            >
                              Drive to this place
                            </button>
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
                    setDirection(null);
                    setZoom(12);
                  }}
                  className="App__btn map__btn-nearby-absolute"
                  style={{ backgroundColor: currentTheme }}
                >
                  Show Nearby Veterinary Health Center
                </button>
              )}
              {/* DIRECTION RENDERER */}
              {direction && direction.response && (
                <DirectionsRenderer directions={direction.response} />
              )}
              {/* CLEAR ROUTE BUTTON */}
              {direction && direction.response && (
                <button
                  className="map__btn-clear-routes"
                  onClick={() => {
                    setDirection(null);
                  }}
                  style={{ backgroundColor: currentTheme, opacity: 0.7 }}
                >
                  Clear Routes
                </button>
              )}
            </GoogleMap>
          </div>
        </div>
      )}
    </div>
  );
}
