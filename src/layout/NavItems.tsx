import React from 'react'
import {
  Building2,
  Calendar,
  FileText,
  Image,
  Landmark,
  LayoutDashboard,
  Mail,
  Newspaper,
  Search,
  Settings,
  Sprout,
  User,
  Users,
  UsersRound,
} from 'lucide-react'
// import { USER_ROLES } from "../enums/UserRole.enum";

export type SidebarItem = {
  icon?: React.ReactNode
  name: string
  path?: string
  new?: boolean
  pro?: boolean
}

export type SidebarSection = {
  name: string
  description?: string
  items: SidebarItem[]
}

export const sidebarSections: SidebarSection[] = [
  {
    name: 'MAIN',
    items: [
      {
        name: 'Dashboard',
        icon: <LayoutDashboard size={18} />,
        path: '/dashboard',
      },
    ],
  },
  {
    name: 'CORE CONTENT',
    description: 'Manage the mission',
    items: [
      // {
      //   name: 'Initiatives',
      //   icon: <Sprout size={16} />,
      // },
      // {
      //   name: 'Heritage Sites',
      //   icon: <Landmark size={16} />,
      // },
      {
        name: 'News & Blog',
        icon: <Newspaper size={16} />,
        path: '/news',
      },
      // {
      //   name: 'Our Moral & Values',
      //   icon: <FileText size={16} />,
      //   path: '/our-moral-values',
      //   new: true,
      // },
    ],
  },
  {
    name: 'COMMUNITY',
    description: 'Manage the people',
    items: [
      {
        name: 'Members',
        icon: <Users size={16} />,
        path: '/members',
      },
      // {
      //   name: 'Volunteers',
      //   icon: <UsersRound size={16} />,
      // },
      // {
      //   name: 'Partners',
      //   icon: <Building2 size={16} />,
      // },
    ],
  },
  {
    name: 'SITE ASSETS',
    description: 'Manage the visuals',
    items: [
      {
        name: 'Gallery',
        icon: <Image size={16} />,
        path: '/gallery',
      },
      // {
      //   name: 'Documents',
      //   icon: <FileText size={16} />,
      // },
      {
        name: 'Hero Section',
        icon: <Image size={16} />,
        path: '/hero-section',
      },
      {
        name: 'Contact Info',
        icon: <Mail size={16} />,
        path: '/contact-info',
      },
    ],
  },
  {
    name: 'ACTIVITIES',
    items: [
      {
        name: 'Events',
        icon: <Calendar size={16} />,
        path: '/events',
      },
      // {
      //   name: 'Inquiries',
      //   icon: <Search size={16} />,
      // },
    ],
  },
  {
    name: 'SETTINGS',
    items: [
      {
        name: 'Team Settings',
        icon: <Settings size={18} />,
        path: '/team-settings',
      },
      {
        name: 'Profile Settings',
        icon: <User size={18} />,
        path: '/profile',
      },
    ],
  },
]
