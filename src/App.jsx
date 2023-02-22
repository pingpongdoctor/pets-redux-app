import "./App.scss";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { addPet, deletePet, updateOwner } from "./features/PetNames";
import { changeTheme } from "./features/ThemeColor";

function App() {
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
  //FUNCTION TO ADD PET
  const handleAddPet = function () {
    dispatch(
      addPet({
        id: petArr[petArr.length - 1].id + 1,
        name: petName,
        owner: ownerName,
      })
    );
  };
  //FUNCTION TO DELETE PET
  const handleDeletePet = function (id) {
    dispatch(
      deletePet({
        id: id,
      })
    );
  };
  //FUNCTION TO UPDATE OWNER
  const handleSetNewOwner = function (id) {
    dispatch(
      updateOwner({
        id: id,
        owner: newOwner,
      })
    );
  };
  //USEEFFECT TO SET THE UPDATED PETARR TO THE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("petArrLocal", JSON.stringify(petArr));
  }, [petArr]);
  //USEEFFECT TO SET THE UPDATED THEME TO THE LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem("themeLocal", color);
  }, [color]);

  return (
    <div style={{ color: currentTheme }} className="App">
      <div>
        <input
          value={color}
          onChange={(event) => {
            setColor(event.target.value);
          }}
          type="text"
          placeholder="The color you wanna change to..."
        />
        <button
          onClick={() => {
            dispatch(changeTheme(color));
          }}
        >
          Change Color
        </button>
      </div>
      <h1>List of pets</h1>
      {/* ADD PET */}
      <div className="add-pet">
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
        <button onClick={handleAddPet}>Add pet</button>
      </div>
      {/* RENDER PETS */}
      <div className="flex-container">
        {petArr.length > 0 &&
          petArr.map((pet) => (
            <div className="flex-item" key={pet.id}>
              <p className="text">id:{pet.id}</p>
              <p className="text">pet name:{pet.name}</p>
              <p className="text">owner name:{pet.owner}</p>
              <input
                onChange={handleUpdateNewOwner}
                type="text"
                placeholder="New owner..."
              />
              <button
                onClick={() => {
                  handleSetNewOwner(pet.id);
                }}
              >
                Add new owner
              </button>
              <button
                onClick={() => {
                  handleDeletePet(pet.id);
                }}
              >
                Delete pet
              </button>
            </div>
          ))}
      </div>
      <button
        className="reset-button"
        onClick={() => {
          localStorage.clear();
          window.location.reload(); //USE THIS TO RELOAD THE CURRENT PAGE
        }}
      >
        Reset the page
      </button>
    </div>
  );
}

export default App;
