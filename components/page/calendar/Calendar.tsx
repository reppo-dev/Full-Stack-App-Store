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
};

const events: Event[] = [
  {
    id: 1,
    image: "/events/event1.jpg",
    title: "Design Conference",
    date: "2026-05-12 07:30",
    address: "56 Davion Mission Suite 157, Meaghanberg",
    attendees: ["/users/u1.jpg", "/users/u2.jpg", "/users/u3.jpg"],
    extraCount: 15,
  },
  {
    id: 2,
    image: "/events/event2.jpg",
    title: "Frontend Meetup",
    date: "2026-05-18 18:00",
    address: "221B Baker Street, London",
    attendees: ["/users/u4.jpg", "/users/u5.jpg", "/users/u6.jpg"],
    extraCount: 9,
  },
  {
    id: 3,
    image: "/events/event3.jpg",
    title: "React Summit",
    date: "2026-06-01 09:00",
    address: "Silicon Valley Center, CA",
    attendees: ["/users/u7.jpg", "/users/u8.jpg", "/users/u9.jpg"],
    extraCount: 22,
  },
  {
    id: 4,
    image: "/events/event4.jpg",
    title: "JavaScript Workshop",
    date: "2026-06-05 14:00",
    address: "Tech Hub Berlin",
    attendees: ["/users/u10.jpg", "/users/u11.jpg", "/users/u12.jpg"],
    extraCount: 6,
  },
  {
    id: 5,
    image: "/events/event5.jpg",
    title: "UI/UX Bootcamp",
    date: "2026-06-10 10:30",
    address: "Design District, Toronto",
    attendees: ["/users/u13.jpg", "/users/u14.jpg", "/users/u15.jpg"],
    extraCount: 12,
  },
  {
    id: 6,
    image: "/events/event6.jpg",
    title: "Startup Pitch Night",
    date: "2026-06-14 19:00",
    address: "Downtown Innovation Lab, NYC",
    attendees: ["/users/u16.jpg", "/users/u17.jpg", "/users/u18.jpg"],
    extraCount: 30,
  },
  {
    id: 7,
    image: "/events/event7.jpg",
    title: "Next.js Conference",
    date: "2026-06-20 11:00",
    address: "Amsterdam Tech Center",
    attendees: ["/users/u19.jpg", "/users/u20.jpg", "/users/u21.jpg"],
    extraCount: 17,
  },
  {
    id: 8,
    image: "/events/event8.jpg",
    title: "AI & Web Summit",
    date: "2026-06-25 09:30",
    address: "San Francisco Expo Hall",
    attendees: ["/users/u22.jpg", "/users/u23.jpg", "/users/u24.jpg"],
    extraCount: 11,
  },
  {
    id: 9,
    image: "/events/event9.jpg",
    title: "Fullstack Developer Day",
    date: "2026-07-02 08:45",
    address: "Tech Park, Singapore",
    attendees: ["/users/u25.jpg", "/users/u26.jpg", "/users/u27.jpg"],
    extraCount: 14,
  },
  {
    id: 10,
    image: "/events/event10.jpg",
    title: "Cloud Engineering Meetup",
    date: "2026-07-08 17:00",
    address: "Google Campus, Dublin",
    attendees: ["/users/u28.jpg", "/users/u29.jpg", "/users/u30.jpg"],
    extraCount: 8,
  },
  {
    id: 11,
    image: "/events/event11.jpg",
    title: "Open Source Hackathon",
    date: "2026-07-12 12:00",
    address: "Community Tech Hall, Austin",
    attendees: ["/users/u31.jpg", "/users/u32.jpg", "/users/u33.jpg"],
    extraCount: 25,
  },
  {
    id: 12,
    image: "/events/event12.jpg",
    title: "Product Design Meetup",
    date: "2026-07-18 16:00",
    address: "Creative Hub, Stockholm",
    attendees: ["/users/u34.jpg", "/users/u35.jpg", "/users/u36.jpg"],
    extraCount: 7,
  },
];

const CalendarComponent = () => {
  return (
    <div className="flex flex-col md:gap-10 md:flex-row items-center justify-center gap-10 mx-auto  ml-2">
      <div className="md:w-4/6 lg:w-3/4 border rounded-lg p-4">
        <Calen />
      </div>
      <div className="md:w-2/6 lg:w-1/4 w-full">
        <SidebarCalendar events={events} />
      </div>
    </div>
  );
};

export default CalendarComponent;
