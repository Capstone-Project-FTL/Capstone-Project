import { AppStateContext, FavoriteViewContext } from "../App/App";
import EventCard from "./EventCard";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardModal from "./CardModal";
import { HeartIcon, PlusSmallIcon, TrashIcon} from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const gridStartTime = new Date(Date.UTC(1970, 0, 1, 6, 0, 0));
const gridEndTime = new Date(Date.UTC(1970, 0, 1, 22, 0, 0));
const getTimeSlots = (schedule) => {
  const timeSlotDays = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
  };

  schedule?.forEach((node) => {
    node.days.forEach((day) => {
      timeSlotDays[day].push(node);
    });
  });
  return timeSlotDays;
};

const cellDuration = 0.5; // fraction in hours
const numOfIterations = Math.ceil(
  (gridEndTime - gridStartTime) / (3600 * 1000 * cellDuration)
); // 0.5 means 30 minutes per divider

export const ModalContext = createContext();
export default function ScheduleContentGrid() {
  const { favState, setFavState } =
    useContext(FavoriteViewContext);
  const tempStartTime = new Date(Date.UTC(1970, 0, 1, 6, 0, 0)); // used to fill the time slots
  const { appState, setAppState } = useContext(AppStateContext);
  const [isOpen, setIsOpen] = useState(false); // for modal view
  const [currentNode, setCurrentNode] = useState(null);
  const [favData, setFavData] = useState({favoriteName: "", isActive : false})
  const navigate = useNavigate();
  if (!(appState.courses && appState.schedules))
    setAppState({
      ...appState,
      courses: JSON.parse(localStorage.getItem("courses")) || [],
      schedules: JSON.parse(localStorage.getItem("schedules")) || [],
    });
  const schedules = favState.showingFavorites ? appState.favorites : appState.schedules;

  useEffect(() => {
    setAppState(appState => ({...appState, currScheduleId: appState.currScheduleId >= schedules.length - 1 ? 0 : appState.currScheduleId}))
  }, [])

  // if async setSappState has not finished setting the state
  const currentSchedule = schedules[appState.currScheduleId];
  const timeSlotDays = getTimeSlots(currentSchedule?.schedule);

  const handleAddFavorites = async (event) => {
    event.preventDefault();
    try {
      const result = await axios.post(
        "http://localhost:3001/schedules/favorite",
        // "https://my-capstone-backend-02def2333679.herokuapp.com/schedules/favorite",
        {...currentSchedule, name: favData.favoriteName},
        { headers: { Authorization: appState.token } }
      );
      // if not addded then very likely we have added the schedule before
      if (result.data.newFav) {
        setAppState((appState) => ({
          ...appState,
          favorites: [...appState.favorites, result.data.newFav.favorite_schedule],
        }));
      }
      setFavData({favoriteName: "", isActive : false})
      toast(result.data.message, {
        position: toast.POSITION.BOTTOM_CENTER,
        hideProgressBar: true,
        pauseOnHover: false,
        closeButton: false,
        pauseOnFocusLoss: false,
        autoClose: 1000,
        className:
          "bg-slate-700 text-white text-sm font-bold m-0 p-0 leading-0 rounded-2xl",
      });
    } catch (error) {
      setAppState((appState) => ({ ...appState, favorites: [] }));
      if (error.code === "ERR_BAD_REQUEST") {
        console.error(error);
        localStorage.removeItem("token");
        setAppState((appState) => ({
          ...appState,
          token: null,
          favorites: [],
        }));
        navigate("/login");
      }
    }
  };

  const handleFormPopUp = (event) => {
    setFavData(favData => ({...favData, isActive: !favData.isActive}))
  }
  const handleFavChange = (event) => {
    setFavData(favData => ({...favData, [event.target.name] : event.target.value}))
  }

  const handleDeleteFavorite = async (event) => {
    event.preventDefault();
    try {
      const result = await axios.delete(
        "http://localhost:3001/schedules/favorite/" + schedules[appState.currScheduleId].name,
        // "https://my-capstone-backend-02def2333679.herokuapp.com/schedules/favorite/" + schedules[appState.currScheduleId].name,
        { headers: { Authorization: appState.token } }
      );
      // if not addded then very likely we have added the schedule before
      if (result.data.deletedSchedule) {
        setAppState((appState) => ({
          ...appState,
          favorites: appState.favorites.filter(favorite => favorite.name != result.data.deletedSchedule.name),
            currScheduleId: 0,
        }));
      }
      setFavData({favoriteName: "", isActive : false})
      setFavState(favState => ({...favState, refetchFav: true}))
      toast(result.data.message, {
        position: toast.POSITION.BOTTOM_CENTER,
        hideProgressBar: true,
        pauseOnHover: false,
        closeButton: false,
        pauseOnFocusLoss: false,
        autoClose: 1500,
        className:
          "bg-slate-700 text-white text-sm font-bold m-0 p-0 leading-0 rounded-2xl",
      });
    } catch (error) {
      setAppState((appState) => ({ ...appState, favorites: [] }));
      if (error.code === "ERR_BAD_REQUEST") {
        console.error(error);
        localStorage.removeItem("token");
        setAppState((appState) => ({
          ...appState,
          token: null,
          favorites: [],
        }));
        navigate("/login");
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-full overflow-scroll">
      <div className="schedule-content-grid flex flex-nowrap divide-x-2 divide-gray-300 text-xl text-black min-w-full w-max ">
        <div
          className={`time-span sticky left-0 grid divide-y-2 divide-gray-300 text-base bg-indigo-100 z-40 w-24 overflow-clip h-full`}>
          <div className="schedule-view-header sticky top-0 left-0 flex  items-center justify-end z-30 bg-indigo-200 w-full grid-flow-col divide-x-2 divide-zinc-600 h-16 text-xl">
            <header className="header-cell text-black font-semibold px-2"></header>
          </div>

          {Array(numOfIterations)
            .fill(0)
            .map((_, i) => {
              tempStartTime.setTime(
                tempStartTime.getTime() + cellDuration * 60 * 60 * 1000
              );
              return (
                <p className="header-cell font-extrabold px-2 flex justify-end text-neutral-600 h-16">
                  {`${String(tempStartTime.getUTCHours()).padStart(
                    2,
                    "0"
                  )}:${String(tempStartTime.getUTCMinutes()).padStart(2, "0")}`}
                </p>
              );
            })}
        </div>
        <div className="w-full h-full flex divide-x-2 relative">
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => (
            <div
              className={`time-span grid grid-flow-row relative divide-y-2 divide-gray-300 text-base min-w-[14rem] md:min-w-[10rem] w-full bg-indigo-50`}
              id={`${idx}`}>
              <div className="schedule-view-header sticky top-0 left-0 flex  items-center justify-start z-30 bg-indigo-200 w-full grid-flow-col divide-x-2 divide-zinc-600 h-16 text-xl">
                <header className="header-cell text-black font-semibold px-4">
                  {day}
                </header>
              </div>

              {Array(numOfIterations)
                .fill(0)
                .map((_, i) => (
                  <div className="h-16">
                    {timeSlotDays[day].map((scheduleNode) => (
                      <ModalContext.Provider value={{ isOpen, setIsOpen }}>
                        <EventCard
                          gridStartTime={gridStartTime}
                          scheduleNode={scheduleNode}
                          setCurrentNode={setCurrentNode}
                        />
                      </ModalContext.Provider>
                    ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
        {isOpen ? (
          <ModalContext.Provider value={{ isOpen, setIsOpen }}>
            <CardModal currentNode={currentNode} />
          </ModalContext.Provider>
        ) : undefined}
        <div className="schedule-view-header fixed bottom-5 right-5 flex items-center justify-end z-50 bg-transparent w-5/6 max-w-[20rem]" style={{borderWidth: 0}}>
          <button
            onClick={favState.showingFavorites ? handleDeleteFavorite : handleFormPopUp}
            className="flex items-center justify-center h-16 w-16 bg-indigo-500 rounded-full sticky z-50 active:bg-indigo-400 shadow-lg">
            {favState.showingFavorites ? <TrashIcon className="w-8 h-8 text-white" /> : <HeartIcon className="w-8 h-8 text-white" />}
            <ToastContainer className="opacity-90" limit={3} />
          </button>
          {favData.isActive && !favState.showingFavorites ? (
            <form className="absolute -top-24 right-20 z-50 drop-shadow-[0_0px_20px_rgba(0,0,0,0.25)] bg-indigo-50 w-full h-36 p-4 flex flex-col rounded-lg gap-4 items-end border-[1px] border-indigo-500"
            onSubmit={handleAddFavorites}>
            <label htmlFor="favoriteName" className="hidden" />
            <input
              type="text"
              placeholder="Name Your Schedule"
              required
              onChange={handleFavChange}
              name="favoriteName"
              value={favData.favoriteName}
              autoComplete="off"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm: sm:leading-6 h-12"
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-indigo-500 rounded-lg sticky z-50 active:bg-indigo-400 shadow-lg text-white w-max px-4 h-12">
              <PlusSmallIcon className="w-8 h-8 text-white" />
              Add
            </button>
          </form>
          ) : undefined}
        </div>
      </div>
    </div>
  );
}
