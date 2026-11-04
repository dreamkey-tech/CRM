/**
 * Device and User Agent parser for CRM Audit Logging.
 * Distinguishes between Mobile (Phones), Tablets, and Desktop (Laptops / PCs),
 * identifying the operating system, browser, and formatting friendly labels.
 */

export interface DeviceInfo {
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN'
  deviceName: string
  os: string
  browser: string
}

export function parseDeviceInfo(userAgent: string | null | undefined): DeviceInfo {
  if (!userAgent || typeof userAgent !== 'string' || userAgent.trim() === '') {
    return {
      deviceType: 'UNKNOWN',
      deviceName: 'Unknown Device',
      os: 'Unknown OS',
      browser: 'Unknown Browser',
    }
  }

  const ua = userAgent.trim()

  // 1. Device Type Detection
  const isTablet = /iPad|Tablet|(Android(?!.*Mobile))|Silk/i.test(ua)
  const isMobile =
    !isTablet &&
    /Mobile|iP(hone|od)|Android.*Mobile|BlackBerry|IEMobile|Kindle|Opera M(obi|ini)|Fennec/i.test(ua)

  const deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN' = isTablet
    ? 'TABLET'
    : isMobile
    ? 'MOBILE'
    : 'DESKTOP'

  // 2. Operating System Detection
  let os = 'Unknown OS'
  if (/Windows NT 10\.0/i.test(ua)) os = 'Windows 10/11'
  else if (/Windows NT 6\.3/i.test(ua)) os = 'Windows 8.1'
  else if (/Windows NT 6\.2/i.test(ua)) os = 'Windows 8'
  else if (/Windows NT 6\.1/i.test(ua)) os = 'Windows 7'
  else if (/Windows/i.test(ua)) os = 'Windows'
  else if (/iPhone OS ([0-9_]+)/i.test(ua)) {
    const match = ua.match(/iPhone OS ([0-9_]+)/i)
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS'
  } else if (/iPad.*OS ([0-9_]+)/i.test(ua)) {
    const match = ua.match(/OS ([0-9_]+)/i)
    os = match ? `iPadOS ${match[1].replace(/_/g, '.')}` : 'iPadOS'
  } else if (/Android ([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Android ([0-9.]+)/i)
    os = match ? `Android ${match[1]}` : 'Android'
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS'
  } else if (/CrOS/i.test(ua)) {
    os = 'ChromeOS'
  } else if (/Linux/i.test(ua)) {
    os = 'Linux'
  }

  // 3. Browser Detection
  let browser = 'Unknown Browser'
  if (/Edg\/([0-9.]+)/i.test(ua)) {
    browser = 'Edge'
  } else if (/OPR\/([0-9.]+)|Opera/i.test(ua)) {
    browser = 'Opera'
  } else if (/Chrome\/([0-9.]+)/i.test(ua) && !/Edg|OPR/i.test(ua)) {
    browser = 'Chrome'
  } else if (/Version\/([0-9.]+).*Safari/i.test(ua)) {
    browser = 'Safari'
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browser = 'Firefox'
  }

  // 4. Human-Readable Device Label
  let deviceName = ''
  if (deviceType === 'MOBILE') {
    if (os.includes('iOS')) {
      deviceName = `Phone (iPhone • ${browser})`
    } else {
      deviceName = `Phone (${os} • ${browser})`
    }
  } else if (deviceType === 'TABLET') {
    if (os.includes('iPad')) {
      deviceName = `Tablet (iPad • ${browser})`
    } else {
      deviceName = `Tablet (${os} • ${browser})`
    }
  } else {
    // DESKTOP / LAPTOP
    if (os === 'macOS') {
      deviceName = `Laptop/Mac (${os} • ${browser})`
    } else {
      deviceName = `Laptop/PC (${os} • ${browser})`
    }
  }

  return {
    deviceType,
    deviceName,
    os,
    browser,
  }
}
