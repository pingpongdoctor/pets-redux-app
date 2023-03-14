import { createSlice } from "@reduxjs/toolkit";

//GET THE COLOR THEME FROM LOCAL STORAGE
const themeLocalStorage = localStorage.getItem("themeLocalStorage");
const themeSlice = createSlice({
  name: "theme",
  initialState: { value: themeLocalStorage ? themeLocalStorage : "black" },
  reducers: {
    //REDUCER TO IMPLEMENT THE CHANGE COLOR THEME ACTION
    changeTheme: (state, action) => {
      state.value = action.payload;
    },
  },
});

//EXPORT THE REDUCER FROM THE SLICE
export default themeSlice.reducer;
//EXPORT THE REDUCER FUNCTIONS
export const { changeTheme } = themeSlice.actions;
