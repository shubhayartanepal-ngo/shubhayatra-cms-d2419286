import React, { useEffect, useCallback, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { navItems, type NavItem } from './NavItems'
import { useSidebar } from '../context/SidebarContext'
// import { useNgoInfo } from "../hooks/useNgoInfo";
import { ChevronDownIcon, HorizontaLDots } from '../icons'

const othersItems: NavItem[] = []

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const location = useLocation()

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others'
    index: number
  } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname])

  useEffect(() => {
    let submenuMatched = false
    ;['main', 'others'].forEach((menuType) => {
      const items = menuType === 'main' ? navItems : othersItems
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others',
                index,
              })
              submenuMatched = true
            }
          })
        }
      })
    })

    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [location, isActive])

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null
      }
      return { type: menuType, index }
    })
  }

  const renderMenuItems = (items: NavItem[], menuType: 'main' | 'others') => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li className="flex flex-col" key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`flex px-3 py-2 gap-3 items-center menu-item group hover:bg-white/10 rounded-md ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer py-2  ${
                !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>

              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}

              {(isExpanded || isHovered || isMobileOpen) && (
                <span
                  className={`ml-auto inline-flex w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? 'rotate-180 text-brand-500'
                      : ''
                  }`}
                >
                  <img src={ChevronDownIcon} alt="down" className="w-5 h-5 brightness-200 invert" />
                </span>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`flex gap-3 px-3 py-2 items-center menu-item group transition-all hover:bg-white/10 rounded-md ${
                  isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : '0px',
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`flex gap-3 px-3 py-2 items-center menu-dropdown-item group transition-all hover:bg-white/10 rounded-md ${
                        isActive(subItem.path)
                          ? 'menu-dropdown-item-active'
                          : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      <span
                        className={`${
                          isActive(subItem.path)
                            ? 'menu-item-icon-active'
                            : 'menu-item-icon-inactive'
                        }`}
                      >
                        {subItem.icon}
                      </span>
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <aside
      style={{ background: 'linear-gradient(rgb(26, 26, 46), rgb(22, 33, 62))' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed mt-16 top-0 left-0 z-30 flex h-screen flex-col border-r border-white/10 px-5 text-slate-100 shadow-2xl transition-all duration-300 ease-in-out lg:mt-0 lg:rounded-br-2xl 
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
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
          <div className="flex flex-row gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 ${
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'Main'
                ) : (
                  <img src={HorizontaLDots} alt="dots" className="w-5 h-5" />
                )}
              </h2>
              {renderMenuItems(navItems, 'main')}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default AppSidebar
