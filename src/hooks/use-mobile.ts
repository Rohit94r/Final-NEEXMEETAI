import * as React from "react"

type WindowWithCapacitor = Window & {
  Capacitor?: {
    isNative?: boolean
  }
}

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const checkMobile = () => {
      // Better detection for native Capacitor environment
      const demandWindow = window as WindowWithCapacitor
      const isNative = demandWindow.Capacitor?.isNative ?? false
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(isNative || isSmallScreen);
    }

    mql.addEventListener("change", checkMobile)
    checkMobile();
    
    return () => mql.removeEventListener("change", checkMobile)
  }, [])

  // During SSR or initial hydration, return false to match desktop default
  // and prevent layout shift loops
  return !!isMobile
}
