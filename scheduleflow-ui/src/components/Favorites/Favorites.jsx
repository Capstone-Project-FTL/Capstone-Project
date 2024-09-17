import { useContext, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import ScheduleList from "../ScheduleDisplay/ScheduleList";
import ScheduleView from "../ScheduleDisplay/ScheduleView";
import { AppStateContext, FavoriteViewContext } from "../App/App";
import axios from "axios";
import NavBar from "../Navbar/Navbar";

export default function Favorites() {
  const { appState, setAppState } = useContext(AppStateContext);
  const { favState, setFavState } =
    useContext(FavoriteViewContext);
  const navigate = useNavigate();
  useEffect(() => {
    setFavState(favState => ({...favState, showingFavorites: true}));
  }, [])

  useEffect(() => {
    const changeSchedulesToFavorite = async() => {
        const response = await axios.get(
          "http://localhost:3001/schedules/favorite",
          // "https://my-capstone-backend-02def2333679.herokuapp.com/schedules/favorite",
          { headers: { Authorization: localStorage.getItem("token")} }
        );
        setAppState((appState) => ({
          ...appState,
          favorites: response.data.favorites.map(schedule => schedule.favorite_schedule),
          currScheduleId: 0
        }));
       
      }
    changeSchedulesToFavorite()
    .catch(error => { if (error.code === "ERR_BAD_REQUEST") localStorage.removeItem("token");
    setAppState({
      user: null,
      token: null,
      favorites: [],
      courses: null,
      schedules: [],
      currScheduleId: 0,
    }); navigate("/login")})
  }, [favState]);

  return (
    <div style={{height: "calc(100vh - 4rem)"}}>
      <NavBar />
      <div className="schedule-display px-8 flex w-full h-full items-center gap-x-12 bg-indigo-100">
      <ScheduleList />
      <ScheduleView />
    </div>
    </div>
  );
}
