// src/contexts/SelectedPlaceContext.jsx
import { createContext, useContext } from "react";

export const SelectedPlaceContext = createContext(null);
export const useSelectedPlace = () => useContext(SelectedPlaceContext);
