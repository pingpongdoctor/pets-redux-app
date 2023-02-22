import "./App.scss";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { addPet, deletePet, updateOwner } from "./features/Pets";
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
    dispatch(
      updateOwner({
        id: id,
        owner: newOwner,
      })
    );
  };
  //USEEFFECT TO SET THE UPDATED PETARR TO THE LOCAL STORAGE
  useEffect(() => {
    if (isPetAndOwnerValid()) {
      localStorage.setItem("petArrLocalStorage", JSON.stringify(petArr));
    }
  }, [petArr]);
  //USEEFFECT TO SET THE UPDATED THEME TO THE LOCAL STORAGE
  useEffect(() => {
    if (isColorValid()) {
      localStorage.setItem("themeLocalStorage", currentTheme);
    }
    setColor("");
  }, [currentTheme]);

  return (
    <div style={{ color: currentTheme }} className="App">
      <div>
        <input
          value={color}
          onChange={(event) => {
            setColor(event.target.value);
          }}
          type="text"
          placeholder="Input color here..."
        />
        <button
          onClick={() => {
            if (isColorValid()) {
              dispatch(changeTheme(color));
              alert(`Color theme has been changed to ${color}`);
            } else {
              alert("Please input color!");
            }
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
                id="new-owner-input"
              />
              <button
                onClick={() => {
                  handleSetNewOwner(pet.id);
                  document.getElementById("new-owner-input").value = "";
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
