// 지금 사용자가 선택한 여행지가 어디인지 모든 화면에 똑같이 알려주는 역할을 한다

import { createContext, useContext } from "react";

export const SelectedPlaceContext = createContext(null);
export const useSelectedPlace = () => useContext(SelectedPlaceContext);
