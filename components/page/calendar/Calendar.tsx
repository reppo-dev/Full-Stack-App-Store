import Calen from "./calen";
import SidebarCalendar from "./sidebarCalendar";

type Event = {
  id: number;
  image: string;
  title: string;
  date: string;
  address: string;
  attendees: string[];
  extraCount: number;
  color?: string;
  startDate?: string;
  endDate?: string;
};

const events: Event[] = [
  {
    id: 1,
    image: "/events/event1.jpg",
    title: "Design Conference",
    date: "2026-05-12",
    address: "56 Davion Mission Suite 157, Meaghanberg",
    attendees: ["/users/u1.jpg", "/users/u2.jpg", "/users/u3.jpg"],
    extraCount: 15,
    color: "#3b82f6",
    startDate: "2026-05-12",
    endDate: "2026-05-14",
  },
  {
    id: 2,
    image: "/events/event2.jpg",
    title: "Frontend Meetup",
    date: "2026-05-18",
    address: "221B Baker Street, London",
    attendees: ["/users/u4.jpg", "/users/u5.jpg", "/users/u6.jpg"],
    extraCount: 9,
    color: "#10b981",
    startDate: "2026-05-18",
    endDate: "2026-05-18",
  },
  {
    id: 3,
    image: "/events/event3.jpg",
    title: "React Summit",
    date: "2026-06-01",
    address: "Silicon Valley Center, CA",
    attendees: ["/users/u7.jpg", "/users/u8.jpg", "/users/u9.jpg"],
    extraCount: 22,
    color: "#8b5cf6",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
  },
  {
    id: 4,
    image: "/events/event4.jpg",
    title: "JavaScript Workshop",
    date: "2026-06-05",
    address: "Tech Hub Berlin",
    attendees: ["/users/u10.jpg", "/users/u11.jpg", "/users/u12.jpg"],
    extraCount: 6,
    color: "#f59e0b",
    startDate: "2026-06-05",
    endDate: "2026-06-05",
  },
  {
    id: 5,
    image: "/events/event5.jpg",
    title: "UI/UX Bootcamp",
    date: "2026-06-10",
    address: "Design District, Toronto",
    attendees: ["/users/u13.jpg", "/users/u14.jpg", "/users/u15.jpg"],
    extraCount: 12,
    color: "#ec4899",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
  },
  {
    id: 6,
    image: "/events/event6.jpg",
    title: "Startup Pitch Night",
    date: "2026-06-14",
    address: "Downtown Innovation Lab, NYC",
    attendees: ["/users/u16.jpg", "/users/u17.jpg", "/users/u18.jpg"],
    extraCount: 30,
    color: "#ef4444",
    startDate: "2026-06-14",
    endDate: "2026-06-14",
  },
  {
    id: 7,
    image: "/events/event7.jpg",
    title: "Next.js Conference",
    date: "2026-06-20",
    address: "Amsterdam Tech Center",
    attendees: ["/users/u19.jpg", "/users/u20.jpg", "/users/u21.jpg"],
    extraCount: 17,
    color: "#06b6d4",
    startDate: "2026-06-20",
    endDate: "2026-06-22",
  },
  {
    id: 8,
    image: "/events/event8.jpg",
    title: "AI & Web Summit",
    date: "2026-06-25",
    address: "San Francisco Expo Hall",
    attendees: ["/users/u22.jpg", "/users/u23.jpg", "/users/u24.jpg"],
    extraCount: 11,
    color: "#14b8a6",
    startDate: "2026-06-25",
    endDate: "2026-06-27",
  },
  {
    id: 9,
    image: "/events/event9.jpg",
    title: "Fullstack Developer Day",
    date: "2026-07-02",
    address: "Tech Park, Singapore",
    attendees: ["/users/u25.jpg", "/users/u26.jpg", "/users/u27.jpg"],
    extraCount: 14,
    color: "#6366f1",
    startDate: "2026-07-02",
    endDate: "2026-07-02",
  },
  {
    id: 10,
    image: "/events/event10.jpg",
    title: "Cloud Engineering Meetup",
    date: "2026-07-08",
    address: "Google Campus, Dublin",
    attendees: ["/users/u28.jpg", "/users/u29.jpg", "/users/u30.jpg"],
    extraCount: 8,
    color: "#84cc16",
    startDate: "2026-07-08",
    endDate: "2026-07-08",
  },
  {
    id: 11,
    image: "/events/event11.jpg",
    title: "Open Source Hackathon",
    date: "2026-07-12",
    address: "Community Tech Hall, Austin",
    attendees: ["/users/u31.jpg", "/users/u32.jpg", "/users/u33.jpg"],
    extraCount: 25,
    color: "#f97316",
    startDate: "2026-07-12",
    endDate: "2026-07-13",
  },
  {
    id: 12,
    image: "/events/event12.jpg",
    title: "Product Design Meetup",
    date: "2026-07-18",
    address: "Creative Hub, Stockholm",
    attendees: ["/users/u34.jpg", "/users/u35.jpg", "/users/u36.jpg"],
    extraCount: 7,
    color: "#a855f7",
    startDate: "2026-07-18",
    endDate: "2026-07-18",
  },
];

const CalendarComponent = () => {
  return (
    <div className="flex flex-col md:gap-10 md:flex-row items-center justify-center gap-10 mx-auto ml-2">
      <div className="md:w-4/6 lg:w-3/4 border rounded-lg p-4">
        <Calen events={events} />
      </div>
      <div className="md:w-2/6 lg:w-1/4 w-full">
        <SidebarCalendar events={events} />
      </div>
    </div>
  );
};

export default CalendarComponent;
