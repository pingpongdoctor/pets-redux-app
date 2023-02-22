import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import petReducer from "./features/PetNames";
import themeReducer from "./features/ThemeColor";
//DEFINE THE STORE
const store = configureStore({
  //PUT THE REDUCERS HERE
  reducer: {
    pets: petReducer,
    theme: themeReducer,
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* PASS DOWN THE STORE TO THE APP ELEMENT */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
