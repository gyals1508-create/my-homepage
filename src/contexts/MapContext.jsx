import { createContext, useContext, useState } from "react";

const MapContext = createContext();

export function MapProvider({ children }) {
  const [mapTarget, setMapTarget] = useState({
    name: "서울",
    lat: 37.5665,
    lng: 126.978,
  });
  return (
    <MapContext.Provider value={{ mapTarget, setMapTarget }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapTarget() {
  return useContext(MapContext);
}
