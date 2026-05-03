import React from "react";
import { LayoutDashboard, FileText, Users, Image, Calendar, Settings, User } from "lucide-react";
// import { USER_ROLES } from "../enums/UserRole.enum";

export type SubNavItem = {
  icon?: React.ReactNode;
  name: string;
  path: string;
  new?: boolean;
  pro?: boolean;
};

export type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: SubNavItem[];
};

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/dashboard",
  },
  {
    name: "Pages",
    icon: <FileText size={18} />,
    subItems: [
      {
        name: "Members",
        icon: <Users size={16} />,
        path: "/members",
      },
      {
        name: "Hero Section",
        icon: <Image size={16} />,
        path: "/",
      },
      {
        name: "Events",
        icon: <Calendar size={16} />,
        path: "/",
      },
    ],
  },
  {
    name: "Setting",
    icon: <Settings size={18} />,
    subItems: [
      {
        name: "Profile",
        icon: <User size={16} />,
        path: "/",
      },
    ],
  },
];
