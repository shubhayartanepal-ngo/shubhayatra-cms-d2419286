import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { sidebarSections, type SidebarItem, type SidebarSection } from './NavItems'
import { useSidebar } from '../context/SidebarContext'
// import { useNgoInfo } from "../hooks/useNgoInfo";
import { ChevronDownIcon, HorizontaLDots } from '../icons'

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const location = useLocation()
  const [openSection, setOpenSection] = useState<number | null>(null)
  const [sectionHeights, setSectionHeights] = useState<Record<number, number>>({})
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname])

  useEffect(() => {
    const matchedSectionIndex = sidebarSections.findIndex((section) =>
      section.items.some((item) => item.path && isActive(item.path))
    )

    setOpenSection(matchedSectionIndex >= 0 ? matchedSectionIndex : null)
  }, [isActive, location.pathname])

  useEffect(() => {
    if (openSection === null) {
      return
    }

    const sectionElement = sectionRefs.current[openSection]
    if (sectionElement) {
      setSectionHeights((currentHeights) => ({
        ...currentHeights,
        [openSection]: sectionElement.scrollHeight,
      }))
    }
  }, [openSection])

  const handleSectionToggle = (index: number) => {
    setOpenSection((currentOpenSection) => (currentOpenSection === index ? null : index))
  }

  const renderMenuItem = (item: SidebarItem) => {
    const content = (
      <>
        <span className={isActive(item.path ?? '') ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
          {item.icon}
        </span>

        {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{item.name}</span>}
      </>
    )

    const baseClass = `flex gap-3 px-3 py-2 items-center menu-item group transition-all hover:bg-white/10 rounded-md ${
      item.path && isActive(item.path) ? 'menu-item-active' : 'menu-item-inactive'
    }`

    if (item.path) {
      return (
        <Link to={item.path} className={baseClass}>
          {content}
        </Link>
      )
    }

    return <div className={`${baseClass} cursor-default opacity-80`}>{content}</div>
  }

  const renderSection = (section: SidebarSection, index: number) => {
    const isOpen = openSection === index

    if (section.name === 'MAIN') {
      return (
        <div key={section.name}>
          <ul className="flex flex-col gap-2">
            {section.items.map((item) => (
              <li key={item.name}>{renderMenuItem(item)}</li>
            ))}
          </ul>
        </div>
      )
    }

    return (
      <div key={section.name}>
        <button
          type="button"
          onClick={() => handleSectionToggle(index)}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:bg-white/10 ${
            !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="flex w-full items-center gap-2">
              <span className="flex flex-col gap-1 text-left">
                <span>{section.name}</span>
                {section.description && (
                  <span className="text-[10px] font-normal tracking-normal text-slate-500 normal-case">
                    {section.description}
                  </span>
                )}
              </span>
              <span className={`ml-auto inline-flex h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-500' : ''}`}>
                <img src={ChevronDownIcon} alt="toggle" className="h-5 w-5 brightness-200 invert" />
              </span>
            </span>
          ) : (
            <img src={HorizontaLDots} alt="dots" className="w-5 h-5" />
          )}
        </button>

        <div
          ref={(element) => {
            sectionRefs.current[index] = element
          }}
          className="overflow-hidden transition-all duration-300"
          style={{
            height:
              isOpen && (isExpanded || isHovered || isMobileOpen)
                ? `${sectionHeights[index] ?? 0}px`
                : '0px',
          }}
        >
          <ul className="mt-2 space-y-1 pl-1">
            {section.items.map((item) => (
              <li key={item.name}>{renderMenuItem(item)}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <aside
      style={{ background: 'linear-gradient(rgb(26, 26, 46), rgb(22, 33, 62))' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed mt-16 top-0 left-0 z-30 flex h-screen flex-col border-r border-white/10 px-5 text-slate-100 shadow-2xl transition-all duration-300 ease-in-out lg:mt-0 lg:rounded-br-2xl 
        ${isExpanded || isMobileOpen ? 'w-72.5' : isHovered ? 'w-72.5' : 'w-22.5'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
    >
      <div
        className={`flex border-b border-white/10 py-8 ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-center'}`}
      >
        <Link to="/" className="flex flex-col justify-center items-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden" src="/logo.png" alt="Logo" width={85} height={40} />
              <img
                className="hidden dark:block"
                src="/logo.png"
                alt="Logo"
                width={85}
                height={40}
              />
              <span className="ml-3 text-center text-sm font-medium tracking-wide text-slate-200">
                Shubayatra Nepal
              </span>
            </>
          ) : (
            <>
              <img src="/logo.png" alt="Logo" width={32} height={32} />
            </>
          )}
        </Link>
      </div>
      <div className="flex flex-row overflow-y-auto pt-6 duration-300 ease-linear no-scrollbar">
        <nav className="mb-6 w-full">
          <div className="flex flex-col gap-4">{sidebarSections.map(renderSection)}</div>
        </nav>
      </div>
    </aside>
  )
}

export default AppSidebar
