// @ts-ignore - Tailwind colors may not have types
import tailwindColors from 'tailwindcss/colors'

/**
 * Type-safe access to Tailwind CSS colors
 * In Tailwind v4, colors are available as an export from the tailwindcss package
 */
export const twColors: Record<string, Record<string, string>> = tailwindColors

/**
 * Resolve a Tailwind color class (e.g., "blue-500") to its hex value
 * @param colorClass - Tailwind color class like "blue-500", "bg-red-600", "primary"
 * @param fallback - Fallback hex color if not found (default: '#3b82f6')
 * @returns Hex color value
 */
export function resolveTailwindColor(colorClass: string, fallback: string = '#3b82f6'): string {
  // If already a hex color, return as-is
  if (colorClass.startsWith('#')) return colorClass
  
  // Remove 'bg-' prefix if present
  const cleanColor = colorClass.replace(/^bg-/, '')
  
  // Handle custom theme colors from CSS variables
  if (cleanColor === 'primary') return getThemeColorFromCss('--primary', fallback)
  if (cleanColor === 'secondary') return getThemeColorFromCss('--secondary', fallback)
  if (cleanColor === 'accent') return getThemeColorFromCss('--accent', fallback)
  if (cleanColor === 'chart-1') return getThemeColorFromCss('--chart-1', fallback)
  if (cleanColor === 'chart-2') return getThemeColorFromCss('--chart-2', fallback)
  if (cleanColor === 'chart-3') return getThemeColorFromCss('--chart-3', fallback)
  if (cleanColor === 'chart-4') return getThemeColorFromCss('--chart-4', fallback)
  if (cleanColor === 'chart-5') return getThemeColorFromCss('--chart-5', fallback)
  
  // Extract color name and shade (e.g., "blue-500" -> ["blue", "500"])
  const parts = cleanColor.split('-')
  if (parts.length !== 2) return fallback
  
  const [colorName, shade] = parts
  
  // Get color from Tailwind's color palette
  const colorPalette = twColors[colorName]
  if (!colorPalette || typeof colorPalette !== 'object') return fallback
  
  const hexValue = colorPalette[shade]
  if (typeof hexValue !== 'string') return fallback
  
  return hexValue
}

/**
 * Get a darker shade of a Tailwind color (useful for borders/accents)
 * @param colorClass - Tailwind color class like "blue-500"
 * @param levels - How many shades darker (default: 2)
 * @returns Hex color value of the darker shade
 */
export function getDarkerColor(colorClass: string, levels: number = 2): string {
  if (colorClass.startsWith('#')) return colorClass
  
  const cleanColor = colorClass.replace(/^bg-/, '')
  const parts = cleanColor.split('-')
  if (parts.length !== 2) return resolveTailwindColor(colorClass)
  
  const [colorName, shade] = parts
  const shadeNum = parseInt(shade)
  
  if (isNaN(shadeNum)) return resolveTailwindColor(colorClass)
  
  // Go darker by specified levels (e.g., 500 + 200 = 700)
  const darkerShade = Math.min(shadeNum + (levels * 100), 950)
  const darkerColor = `${colorName}-${darkerShade}`
  
  return resolveTailwindColor(darkerColor, resolveTailwindColor(colorClass))
}

/**
 * Get a lighter shade of a Tailwind color
 * @param colorClass - Tailwind color class like "blue-500"
 * @param levels - How many shades lighter (default: 2)
 * @returns Hex color value of the lighter shade
 */
export function getLighterColor(colorClass: string, levels: number = 2): string {
  if (colorClass.startsWith('#')) return colorClass
  
  const cleanColor = colorClass.replace(/^bg-/, '')
  const parts = cleanColor.split('-')
  if (parts.length !== 2) return resolveTailwindColor(colorClass)
  
  const [colorName, shade] = parts
  const shadeNum = parseInt(shade)
  
  if (isNaN(shadeNum)) return resolveTailwindColor(colorClass)
  
  // Go lighter by specified levels (e.g., 500 - 200 = 300)
  const lighterShade = Math.max(shadeNum - (levels * 100), 50)
  const lighterColor = `${colorName}-${lighterShade}`
  
  return resolveTailwindColor(lighterColor, resolveTailwindColor(colorClass))
}

/**
 * Helper to get theme color from CSS variable and convert to hex
 */
function getThemeColorFromCss(variableName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  
  const styles = getComputedStyle(document.documentElement)
  const value = styles.getPropertyValue(variableName).trim()
  
  if (!value) return fallback
  if (value.startsWith('#')) return value
  
  // Convert oklch/other formats to hex
  const temp = document.createElement('div')
  temp.style.color = value
  temp.style.display = 'none'
  document.body.appendChild(temp)
  const computedColor = getComputedStyle(temp).color
  document.body.removeChild(temp)
  
  // Convert rgb(r, g, b) to hex
  const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (match && match[1] && match[2] && match[3]) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0')
    const g = parseInt(match[2]).toString(16).padStart(2, '0')
    const b = parseInt(match[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }
  
  return fallback
}

/**
 * All available Tailwind color names
 */
export const tailwindColorNames = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
] as const

/**
 * All available Tailwind shades
 */
export const tailwindShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

export type TailwindColorName = typeof tailwindColorNames[number]
export type TailwindShade = typeof tailwindShades[number]
export type TailwindColorClass = `${TailwindColorName}-${TailwindShade}`
