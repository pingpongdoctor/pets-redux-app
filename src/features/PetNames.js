import { createSlice } from "@reduxjs/toolkit";
import { petData } from "../data/petData";

//GET PET ARRAY FROM THE LOCAL STORAGE
const petDataLocal = JSON.parse(localStorage.getItem("petArrLocal"));
//DEFINE THE SLICE
const petSlice = createSlice({
  //NAME OF THE CHAIN ACTIONS
  name: "pets",
  //THE VALUE OF THE STATE
  initialState: {
    //IF THE PETDATA IS NOT SAVED IN THE LOCAL STORAGE, GET THE PETDATA
    //IF IT IS SAVED, GET THE LOCAL DATA
    value: petDataLocal ? petDataLocal : petData,
  },
  //THE REDUCER TO IMPLEMENT THE ACTIONS
  reducers: {
    //ADDPET ACTION
    addPet: (state, action) => {
      state.value.push(action.payload); //ACTION.PAYLOAD IS THE DATA WE USE TO UDATE THE STATE
    },
    //DELETE PET ACTION
    deletePet: (state, action) => {
      state.value = state.value.filter((obj) => obj.id !== action.payload.id);
    },
    //CHANGE OWNER FOR PET
    updateOwner: (state, action) => {
      state.value = state.value.map((obj) => {
        if (obj.id === action.payload.id) {
          obj.owner = action.payload.owner;
        }
        return obj;
      });
    },
  },
});

//EXPORT THE REDUCER FROM THE SLICE
export default petSlice.reducer;
//EXPORT THE REDUCER FUNCTIONS
export const { addPet, deletePet, updateOwner } = petSlice.actions;
