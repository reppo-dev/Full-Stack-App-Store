import SidebarCalendar from "./sidebarCalendar";

const CalendarComponent = () => {
  return (
    <div className="flex flex-col md:gap-10 md:flex-row items-center justify-center gap-10 mx-auto">
      <div className="md:w-4/6 lg:w-3/4 ">sdsdsd</div>
      <div className="md:w-2/6 lg:w-1/4 w-full ml-2">
        <SidebarCalendar />
      </div>
    </div>
  );
};

export default CalendarComponent;
