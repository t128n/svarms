import { ref, onMounted, type Ref } from 'vue'

/**
 * Composable to read CSS custom properties (CSS variables) from the document root.
 * Useful for accessing Tailwind v4 @theme inline colors at runtime.
 */
export function useCssVariable(variableName: string): Ref<string> {
  const value = ref('')

  onMounted(() => {
    const styles = getComputedStyle(document.documentElement)
    // Remove -- prefix if provided
    const cleanName = variableName.startsWith('--') ? variableName : `--${variableName}`
    value.value = styles.getPropertyValue(cleanName).trim()
  })

  return value
}

/**
 * Get a CSS variable value synchronously (use in computed properties)
 */
export function getCssVariable(variableName: string): string {
  if (typeof window === 'undefined') return ''
  const styles = getComputedStyle(document.documentElement)
  const cleanName = variableName.startsWith('--') ? variableName : `--${variableName}`
  return styles.getPropertyValue(cleanName).trim()
}

/**
 * Get all chart colors from your theme
 */
export function getChartColors(): Record<string, string> {
  return {
    chart1: getCssVariable('--chart-1'),
    chart2: getCssVariable('--chart-2'),
    chart3: getCssVariable('--chart-3'),
    chart4: getCssVariable('--chart-4'),
    chart5: getCssVariable('--chart-5'),
    primary: getCssVariable('--primary'),
    secondary: getCssVariable('--secondary'),
    accent: getCssVariable('--accent'),
  }
}

/**
 * Convert oklch color to hex (if your CSS uses oklch format)
 * ECharts needs hex or rgb, so you may need conversion
 */
export function oklchToHex(oklchString: string): string {
  // Create a temporary element to convert oklch to hex
  const temp = document.createElement('div')
  temp.style.color = oklchString
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
  
  return oklchString
}

/**
 * Get theme color as hex (handles oklch conversion automatically)
 */
export function getThemeColorHex(variableName: string): string {
  const value = getCssVariable(variableName)
  if (!value) return '#000000'
  
  // If already hex, return as-is
  if (value.startsWith('#')) return value
  
  // Convert oklch to hex
  return oklchToHex(value)
}
