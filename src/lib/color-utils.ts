// @ts-ignore - culori doesn't have types but works fine
import { formatHex, oklch } from 'culori'

// Cache for resolved colors to avoid repeated computations
const colorCache = new Map<string, string>()

/**
 * Convert OKLCH color string to hex
 * @param oklchString - e.g., "oklch(62.3% 0.214 259.815)"
 * @returns hex color e.g., "#3b82f6"
 */
export function oklchToHex(oklchString: string): string {
  try {
    // Parse: oklch(L% C H) or oklch(L% C H / A)
    const match = oklchString.match(/oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/)
    if (!match) {
      console.warn(`Invalid OKLCH format: ${oklchString}`)
      return '#3b82f6' // fallback to blue-500
    }

    const [, l, c, h] = match
    const color = oklch({
      mode: 'oklch',
      l: parseFloat(l!) / 100, // Convert percentage to 0-1
      c: parseFloat(c!),
      h: parseFloat(h!)
    })

    return formatHex(color)
  } catch (error) {
    console.warn(`Error converting OKLCH to hex: ${oklchString}`, error)
    return '#3b82f6' // fallback to blue-500
  }
}

/**
 * Resolve Tailwind color class to hex
 * Uses Tailwind v4's CSS variable system to get color values
 * @param colorClass - e.g., "blue-500" or "bg-blue-500"
 * @returns hex color e.g., "#3b82f6"
 */
export function resolveTailwindColor(colorClass: string): string {
  // If already hex, return as-is
  if (colorClass.startsWith('#')) {
    return colorClass
  }

  // Check cache first for performance
  if (colorCache.has(colorClass)) {
    return colorCache.get(colorClass)!
  }

  // Remove 'bg-' prefix if present
  const cleanColor = colorClass.replace(/^bg-/, '')

  // Get CSS variable value (Tailwind v4 exposes colors as --color-{name}-{shade})
  const cssVarName = `--color-${cleanColor}`
  const cssValue = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarName)
    .trim()

  if (!cssValue) {
    console.warn(
      `Color not found: ${colorClass}. Make sure it's safelisted in globals.css or exists in Tailwind's theme.`
    )
    const fallback = '#3b82f6'
    colorCache.set(colorClass, fallback)
    return fallback
  }

  // Convert OKLCH to hex
  const hexColor = oklchToHex(cssValue)
  
  // Cache result for future calls
  colorCache.set(colorClass, hexColor)
  
  return hexColor
}

/**
 * Get a darker shade of a Tailwind color
 * @param colorClass - e.g., "blue-500"
 * @param shadeOffset - number to add to shade (default: 200, e.g., 500 → 700)
 * @returns hex color of darker shade
 */
export function getDarkerShade(colorClass: string, shadeOffset: number = 200): string {
  // If hex color, return as-is (can't auto-darken)
  if (colorClass.startsWith('#')) {
    return colorClass
  }

  // Remove 'bg-' prefix
  const cleanColor = colorClass.replace(/^bg-/, '')

  // Parse color name and shade: "blue-500" -> ["blue", "500"]
  const match = cleanColor.match(/^(.+)-(\d+)$/)
  if (!match) {
    // If no shade number (e.g., just "blue"), can't darken automatically
    return resolveTailwindColor(colorClass)
  }

  const [, colorName, shadeStr] = match
  const currentShade = parseInt(shadeStr!, 10)
  
  // Calculate darker shade (clamp to max 950)
  const darkerShade = Math.min(currentShade + shadeOffset, 950)
  
  // Resolve the darker color
  const darkerColorClass = `${colorName}-${darkerShade}`
  return resolveTailwindColor(darkerColorClass)
}

/**
 * Clear the color cache (useful for testing or theme changes)
 */
export function clearColorCache(): void {
  colorCache.clear()
}
