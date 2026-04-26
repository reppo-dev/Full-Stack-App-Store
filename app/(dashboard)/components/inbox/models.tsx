export type Label = "Primary" | "Work" | "Social" | "Friends";

export interface Message {
  id: string;
  sender: "me" | "other";
  text: string;
  time: string;
}

export interface Email {
  id: string;
  name: string;
  subject: string;
  preview: string;
  label: Label;
  time: string;
  starred: boolean;
  read: boolean;
  messages: Message[];
}

export const emails: Email[] = [
  {
    id: "1",
    name: "Jullu Jalal",
    subject: "Our Bachelor of Commerce program",
    preview: "Our Bachelor of Commerce program is ACBSP-accredited.",
    label: "Primary",
    time: "8:38 AM",
    starred: false,
    read: true,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Our Bachelor of Commerce program is ACBSP-accredited.",
        time: "8:30 AM",
      },
      {
        id: "m2",
        sender: "me",
        text: "Thanks for the information.",
        time: "8:38 AM",
      },
    ],
  },
  {
    id: "2",
    name: "Minerva Barnett",
    subject: "Get Best Advertiser",
    preview: "Get Best Advertiser In Your Side Pocket",
    label: "Work",
    time: "8:13 AM",
    starred: false,
    read: false,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Get Best Advertiser In Your Side Pocket.",
        time: "8:10 AM",
      },
    ],
  },
  {
    id: "3",
    name: "Peter Lewis",
    subject: "Vacation Home Rental",
    preview: "Vacation Home Rental Success",
    label: "Friends",
    time: "7:52 PM",
    starred: false,
    read: true,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Vacation Home Rental Success tips inside.",
        time: "7:40 PM",
      },
    ],
  },
  {
    id: "4",
    name: "Anthony Briggs",
    subject: "Free Classifieds",
    preview: "Free Classifieds Using Them To Promote Your Stuff Online",
    label: "Primary",
    time: "7:52 PM",
    starred: true,
    read: true,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Free Classifieds Using Them To Promote Your Stuff Online.",
        time: "7:45 PM",
      },
    ],
  },
  {
    id: "5",
    name: "Clifford Morgan",
    subject: "Enhance Your Brand",
    preview: "Enhance Your Brand Potential With Giant Advertising Blimps",
    label: "Social",
    time: "4:13 PM",
    starred: false,
    read: true,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Enhance Your Brand Potential With Giant Advertising Blimps.",
        time: "4:00 PM",
      },
    ],
  },
  {
    id: "6",
    name: "Cecilia Webster",
    subject: "Always Look On The Bright Side",
    preview: "Always Look On The Bright Side Of Life",
    label: "Friends",
    time: "3:52 PM",
    starred: false,
    read: false,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Always Look On The Bright Side Of Life.",
        time: "3:40 PM",
      },
    ],
  },
  {
    id: "7",
    name: "Harvey Manning",
    subject: "Curling Irons",
    preview: "Curling Irons Are As Individual As The Women Who Use Them",
    label: "Primary",
    time: "2:30 PM",
    starred: true,
    read: true,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Curling Irons Are As Individual As The Women Who Use Them.",
        time: "2:20 PM",
      },
    ],
  },
  {
    id: "8",
    name: "Willie Blake",
    subject: "Commerce Program",
    preview: "Our Bachelor of Commerce program is ACBSP-accredited.",
    label: "Primary",
    time: "8:38 AM",
    starred: false,
    read: true,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Our Bachelor of Commerce program is ACBSP-accredited.",
        time: "8:30 AM",
      },
    ],
  },
  {
    id: "9",
    name: "Fanny Weaver",
    subject: "Promote Your Stuff",
    preview: "Free Classifieds Using Them To Promote Your Stuff Online",
    label: "Work",
    time: "7:52 PM",
    starred: true,
    read: true,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Free Classifieds Using Them To Promote Your Stuff Online.",
        time: "7:40 PM",
      },
    ],
  },
  {
    id: "10",
    name: "Olga Hogan",
    subject: "Brand Potential",
    preview: "Enhance Your Brand Potential With Giant Advertising Blimps",
    label: "Social",
    time: "4:13 PM",
    starred: false,
    read: false,
    messages: [
      {
        id: "m1",
        sender: "other",
        text: "Enhance Your Brand Potential With Giant Advertising Blimps.",
        time: "4:00 PM",
      },
    ],
  },
];
