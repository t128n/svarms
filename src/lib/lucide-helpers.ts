// Import pre-parsed icon data from lucide-static
// This JSON file contains all icon definitions as [elementType, attributes][] arrays
import iconNodes from 'lucide-static/icon-nodes.json'
import { resolveTailwindColor, getDarkerShade } from './color-utils'

// Type definitions for icon elements
export type IconElement = [string, Record<string, string>]

// Icon element cache to avoid repeated processing
const iconCache = new Map<string, IconElement[] | null>()

/**
 * Normalize icon name to kebab-case format used by lucide-static
 * @param name - "CircleUser", "circle-user", "CIRCLE_USER", or "circle_user"
 * @returns "circle-user"
 */
function normalizeIconName(name: string): string {
  return name
    .replace(/([A-Z])/g, '-$1') // PascalCase to kebab-case
    .replace(/_/g, '-')          // snake_case to kebab-case
    .toLowerCase()
    .replace(/^-/, '')           // Remove leading dash
}

/**
 * Get icon elements for a Lucide icon
 * @param iconName - icon name in any case format
 * @returns array of icon elements or null if not found
 */
export function getLucideIconElements(iconName: string): IconElement[] | null {
  const normalizedName = normalizeIconName(iconName)
  
  // Check cache first
  if (iconCache.has(normalizedName)) {
    return iconCache.get(normalizedName)!
  }
  
  // Look up icon in the imported JSON data
  const elements = (iconNodes as any)[normalizedName] as IconElement[] | undefined
  
  if (!elements) {
    console.warn(`Icon not found: ${iconName} (normalized: ${normalizedName})`)
    iconCache.set(normalizedName, null)
    return null
  }
  
  // Cache and return
  iconCache.set(normalizedName, elements)
  return elements
}

/**
 * Create SVG data URI for an icon with circular background
 * @param elements - icon element definitions
 * @param bgColor - background color (Tailwind class or hex)
 * @param iconColor - icon stroke color (hex)
 * @returns SVG data URI for use in ECharts
 */
export function createIconSymbol(
  elements: IconElement[],
  bgColor: string,
  iconColor: string = '#ffffff'
): string {
  const backgroundColor = resolveTailwindColor(bgColor)
  const borderColor = getDarkerShade(bgColor, 200)
  
  // Build icon content from elements
  let iconContent = ''
  elements.forEach(([tag, attrs]) => {
    const attrsStr = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')
    iconContent += `<${tag} ${attrsStr}/>`
  })
  
  // Create SVG with circular background and icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="3"/>
    <g transform="translate(12, 12)">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${iconContent}
      </svg>
    </g>
  </svg>`
  
  return `image://data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Get complete icon symbol for use in ECharts
 * @param iconName - icon name in any case format
 * @param bgColor - background color (Tailwind class or hex)
 * @param iconColor - icon stroke color (default: white)
 * @returns SVG data URI or fallback icon
 */
export function getLucideSymbol(
  iconName: string,
  bgColor: string = 'blue-500',
  iconColor: string = '#ffffff'
): string {
  const elements = getLucideIconElements(iconName)
  
  if (!elements) {
    // Fallback to CircleUser icon
    console.warn(`Using fallback icon (CircleUser) for: ${iconName}`)
    const fallbackElements = getLucideIconElements('CircleUser')
    if (!fallbackElements) {
      throw new Error('Failed to load fallback icon CircleUser')
    }
    return createIconSymbol(fallbackElements, bgColor, iconColor)
  }
  
  return createIconSymbol(elements, bgColor, iconColor)
}

/**
 * Pre-load multiple icons to populate cache
 * Useful for loading all icons used in data before rendering
 * @param iconNames - array of icon names to pre-load
 * @returns void
 */
export function preloadIcons(iconNames: string[]): void {
  iconNames.forEach(iconName => {
    getLucideIconElements(iconName)
  })
}

/**
 * Clear the icon cache (useful for testing)
 */
export function clearIconCache(): void {
  iconCache.clear()
}
