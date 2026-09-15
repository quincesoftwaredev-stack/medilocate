import { fetchPlaceName } from "@/utility/helper";
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: Cookies.get("userInfo")
      ? JSON.parse(Cookies.get("userInfo"))
      : null,
    location: Cookies.get("location")
      ? JSON.parse(Cookies.get("location"))
      : null,
    address: Cookies.get("address")
      ? JSON.parse(Cookies.get("address"))
      : null,
    // userInfo: null,
  },

  reducers: {
    login: (state, action) => {
      Cookies.set("userInfo", JSON.stringify(action.payload));
      state.userInfo = action.payload;
    },
    logout: (state) => {
      Cookies.remove("userInfo");
      state.userInfo = null;
    },
    setLocation: (state, action) => {
      console.log(action.payload);
      Cookies.set("location", JSON.stringify(action.payload));
      state.location = action.payload;
    },
    removeLocation: (state) => {
      Cookies.remove("location");
      state.location = null;
    },

    setAddress: (state, action) => {
      console.log(action.payload);
      Cookies.set("address", JSON.stringify(action.payload));
      state.address = action.payload;
    },
    removeAddress: (state) => {
      Cookies.remove("address");
      state.address = null;
    },



  },
});

// Action creators are generated for each case reducer function
export const { login, logout, setLocation,
  removeLocation } = userSlice.actions;

export default userSlice.reducer;
