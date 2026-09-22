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
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop",
    title: "Design Conference",
    date: "2026-05-12",
    address: "56 Davion Mission Suite 157, Meaghanberg",
    attendees: [],
    extraCount: 15,
    color: "#3b82f6",
    startDate: "2026-05-12",
    endDate: "2026-05-14",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=100&h=100&fit=crop",
    title: "Frontend Meetup",
    date: "2026-05-18",
    address: "221B Baker Street, London",
    attendees: [],
    extraCount: 9,
    color: "#10b981",
    startDate: "2026-05-18",
    endDate: "2026-05-18",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=100&h=100&fit=crop",
    title: "React Summit",
    date: "2026-06-01",
    address: "Silicon Valley Center, CA",
    attendees: [],
    extraCount: 22,
    color: "#8b5cf6",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=100&fit=crop",
    title: "JavaScript Workshop",
    date: "2026-06-05",
    address: "Tech Hub Berlin",
    attendees: [],
    extraCount: 6,
    color: "#f59e0b",
    startDate: "2026-06-05",
    endDate: "2026-06-05",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=100&h=100&fit=crop",
    title: "UI/UX Bootcamp",
    date: "2026-06-10",
    address: "Design District, Toronto",
    attendees: [],
    extraCount: 12,
    color: "#ec4899",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=100&h=100&fit=crop",
    title: "Startup Pitch Night",
    date: "2026-06-14",
    address: "Downtown Innovation Lab, NYC",
    attendees: [],
    extraCount: 30,
    color: "#ef4444",
    startDate: "2026-06-14",
    endDate: "2026-06-14",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop",
    title: "Next.js Conference",
    date: "2026-06-20",
    address: "Amsterdam Tech Center",
    attendees: [],
    extraCount: 17,
    color: "#06b6d4",
    startDate: "2026-06-20",
    endDate: "2026-06-22",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop",
    title: "AI & Web Summit",
    date: "2026-06-25",
    address: "San Francisco Expo Hall",
    attendees: [],
    extraCount: 11,
    color: "#14b8a6",
    startDate: "2026-06-25",
    endDate: "2026-06-27",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=100&h=100&fit=crop",
    title: "Fullstack Developer Day",
    date: "2026-07-02",
    address: "Tech Park, Singapore",
    attendees: [],
    extraCount: 14,
    color: "#6366f1",
    startDate: "2026-07-02",
    endDate: "2026-07-02",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=100&h=100&fit=crop",
    title: "Cloud Engineering Meetup",
    date: "2026-07-08",
    address: "Google Campus, Dublin",
    attendees: [],
    extraCount: 8,
    color: "#84cc16",
    startDate: "2026-07-08",
    endDate: "2026-07-08",
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=100&h=100&fit=crop",
    title: "Open Source Hackathon",
    date: "2026-07-12",
    address: "Community Tech Hall, Austin",
    attendees: [],
    extraCount: 25,
    color: "#f97316",
    startDate: "2026-07-12",
    endDate: "2026-07-13",
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1558403194-611308249627?w=100&h=100&fit=crop",
    title: "Product Design Meetup",
    date: "2026-07-18",
    address: "Creative Hub, Stockholm",
    attendees: [],
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
