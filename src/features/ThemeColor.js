import { createSlice } from "@reduxjs/toolkit";

const themeLocal = localStorage.getItem("themeLocal");

const themeSlice = createSlice({
  name: "theme",
  initialState: themeLocal ? { value: themeLocal } : { value: "blue" },
  reducers: {
    changeTheme: (state, action) => {
      state.value = action.payload;
    },
  },
});

//EXPORT THE REDUCER FROM THE SLICE
export default themeSlice.reducer;
//EXPORT THE REDUCER FUNCTIONS
export const { changeTheme } = themeSlice.actions;
