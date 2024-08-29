'use client'

import { FiSun, FiMoon } from "react-icons/fi"
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { ImSpinner8 } from "react-icons/im"

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() =>  setMounted(true), [])

  if (!mounted) return (
    <ImSpinner8 className="animate-spin mr-10 text-dark dark:text-white"/>
  )

  if (resolvedTheme === 'dark') {
    return <FiSun className="text-white cursor-pointer mr-10 p-1.5 hover:bg-azul-900/50 duration-200 rounded-full" size={32} onClick={() => setTheme('light')}/>
  }

  if (resolvedTheme === 'light') {
    return <FiMoon className="text-black cursor-pointer mr-10 p-1.5 hover:bg-azul-900/30 duration-200 rounded-full" size={32} onClick={() => setTheme('dark')}/>
  }

}