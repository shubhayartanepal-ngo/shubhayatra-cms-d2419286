import React from 'react'
import {
  Calendar,
  FileText,
  IdCard,
  Image,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from 'lucide-react'
// import { USER_ROLES } from "../enums/UserRole.enum";

export type SubNavItem = {
  icon?: React.ReactNode
  name: string
  path: string
  new?: boolean
  pro?: boolean
}

export type NavItem = {
  name: string
  icon?: React.ReactNode
  path?: string
  subItems?: SubNavItem[]
}

export const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    path: '/dashboard',
  },
  {
    name: 'Pages',
    icon: <FileText size={18} />,
    subItems: [
      {
        name: 'Members',
        icon: <Users size={16} />,
        path: '/members',
      },
      {
        name: 'Gallery',
        icon: <Image size={16} />,
        path: '/gallery',
      },
      {
        name: 'Team Settings',
        icon: <IdCard size={16} />,
        path: '/team-settings',
      },
      {
        name: 'Hero Section',
        icon: <Image size={16} />,
        path: '/',
      },
      {
        name: 'Events',
        icon: <Calendar size={16} />,
        path: '/',
      },
    ],
  },
  {
    name: 'Setting',
    icon: <Settings size={18} />,
    subItems: [
      {
        name: 'Profile',
        icon: <User size={16} />,
        path: '/profile',
      },
    ],
  },
]
