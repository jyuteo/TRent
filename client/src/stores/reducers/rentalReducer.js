import { createSlice } from "@reduxjs/toolkit";

const rentalSlice = createSlice({
  name: "rental",
  initialState: {
    isFetchingRentalDetails: false,
    fetchRentalDetailsCompleted: false,
  },
  reducers: {
    fetchRentalDetailsReset: (state) => {
      state.isFetchingRentalDetails = false;
      state.fetchRentalDetailsCompleted = false;
    },
    fetchRentalDetailsStart: (state) => {
      state.isFetchingRentalDetails = true;
      state.fetchRentalDetailsCompleted = false;
    },
    fetchRentalDetailsCompleted: (state) => {
      state.isFetchingRentalDetails = false;
      state.fetchRentalDetailsCompleted = true;
    },
  },
});

export const { fetchRentalDetailsReset, fetchRentalDetailsCompleted } =
  rentalSlice.actions;

export default rentalSlice.reducer;
