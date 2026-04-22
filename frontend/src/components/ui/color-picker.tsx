'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Palette, Eye, EyeOff } from "lucide-react"

/**
 * ColorPicker component - Interactive color selection
 * Provides various color selection methods
 * 
 * @param value - Current color value
 * @param onChange - Callback when color changes
 * @param presetColors - Array of preset colors
 * @param showAlpha - Whether to show alpha channel
 * @param showHex - Whether to show hex input
 * @param showPresets - Whether to show preset colors
 * @param size - Picker size: 'sm' | 'md' | 'lg'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Color picker component
 * 
 * @example
 * <ColorPicker 
 *   value="#3b82f6" 
 *   onChange={setColor}
 *   presetColors={['#ef4444', '#3b82f6', '#10b981']}
 *   showAlpha
 * />
 */
interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  presetColors?: string[]
  showAlpha?: boolean
  showHex?: boolean
  showPresets?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ 
    value = '#000000', 
    onChange, 
    presetColors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e', '#000000', '#6b7280', '#ffffff'
    ],
    showAlpha = false,
    showHex = true,
    showPresets = true,
    size = 'md',
    className,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(value)
    const [hue, setHue] = React.useState(0)
    const [saturation, setSaturation] = React.useState(0)
    const [lightness, setLightness] = React.useState(0)
    const [alpha, setAlpha] = React.useState(1)

    const currentColor = value !== undefined ? value : internalValue

    // Parse color and update HSL values
    React.useEffect(() => {
      const { h, s, l, a } = hexToHsla(currentColor)
      setHue(h)
      setSaturation(s)
      setLightness(l)
      setAlpha(a)
    }, [currentColor])

    const handleColorChange = React.useCallback((newColor: string) => {
      if (value === undefined) {
        setInternalValue(newColor)
      }
      onChange?.(newColor)
    }, [value, onChange])

    const handleSaturationLightnessChange = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const newSaturation = (x / rect.width) * 100
      const newLightness = 100 - (y / rect.height) * 100
      
      setSaturation(newSaturation)
      setLightness(newLightness)
      
      const newColor = hslaToHex(hue, newSaturation, newLightness, alpha)
      handleColorChange(newColor)
    }

    const handleHueChange = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newHue = (x / rect.width) * 360
      
      setHue(newHue)
      
      const newColor = hslaToHex(newHue, saturation, lightness, alpha)
      handleColorChange(newColor)
    }

    const handleAlphaChange = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newAlpha = x / rect.width
      
      setAlpha(newAlpha)
      
      const newColor = hslaToHex(hue, saturation, lightness, newAlpha)
      handleColorChange(newColor)
    }

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
        handleColorChange(hex)
      }
    }

    const handlePresetClick = (color: string) => {
      handleColorChange(color)
    }

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    }

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {/* Color preview button */}
        <Button
          variant="outline"
          size={size}
          className={cn(
            "p-0 border-2",
            sizeClasses[size]
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div
            className="w-full h-full rounded-md border-2 border-white"
            style={{ backgroundColor: currentColor }}
          />
        </Button>

        {/* Color picker popup */}
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-background border rounded-lg shadow-lg w-80">
            {/* Saturation/Lightness picker */}
            <div className="mb-4">
              <div
                className="relative w-full h-32 rounded-md cursor-pointer"
                style={{
                  backgroundColor: `hsl(${hue}, 100%, 50%)`,
                  backgroundImage: 'linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, transparent)'
                }}
                onClick={handleSaturationLightnessChange}
              >
                <div
                  className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${saturation}%`,
                    top: `${100 - lightness}%`
                  }}
                />
              </div>
            </div>

            {/* Hue slider */}
            <div className="mb-4">
              <div
                className="relative w-full h-6 rounded-md cursor-pointer"
                style={{
                  backgroundImage: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                }}
                onClick={handleHueChange}
              >
                <div
                  className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(hue / 360) * 100}%`,
                    top: '50%'
                  }}
                />
              </div>
            </div>

            {/* Alpha slider */}
            {showAlpha && (
              <div className="mb-4">
                <div
                  className="relative w-full h-6 rounded-md cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to right, transparent, ${currentColor})`,
                    backgroundColor: 'repeating-conic-gradient(#808080 0% 25%, white 0% 50%) 50% / 20px 20px'
                  }}
                  onClick={handleAlphaChange}
                >
                  <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${alpha * 100}%`,
                      top: '50%'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Hex input */}
            {showHex && (
              <div className="mb-4">
                <Input
                  value={currentColor}
                  onChange={handleHexChange}
                  placeholder="#000000"
                  className="font-mono"
                />
              </div>
            )}

            {/* Preset colors */}
            {showPresets && (
              <div className="grid grid-cols-10 gap-2">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    className="w-6 h-6 rounded-md border-2 border-white hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetClick(color)}
                  />
                ))}
              </div>
            )}

            {/* Close button */}
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    )
  }
)
ColorPicker.displayName = "ColorPicker"

/**
 * ColorSwatch component - Simple color swatch
 * 
 * @param color - Color value
 * @param size - Swatch size: 'sm' | 'md' | 'lg'
 * @param rounded - Whether swatch is rounded
 * @param className - Additional CSS classes
 * @returns JSX.Element - Color swatch
 * 
 * @example
 * <ColorSwatch color="#3b82f6" size="md" rounded />
 */
export const ColorSwatch: React.FC<{
  color: string
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  className?: string
}> = ({
  color,
  size = 'md',
  rounded = false,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div
      className={cn(
        "border-2 border-white shadow-sm",
        sizeClasses[size],
        rounded ? "rounded-full" : "rounded",
        className
      )}
      style={{ backgroundColor: color }}
    />
  )
}

/**
 * ColorPalette component - Grid of color swatches
 * 
 * @param colors - Array of colors
 * @param selectedColor - Currently selected color
 * @param onSelect - Callback when color is selected
 * @param columns - Number of columns
 * @param size - Swatch size: 'sm' | 'md' | 'lg'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Color palette
 * 
 * @example
 * <ColorPalette 
 *   colors={colorArray}
 *   selectedColor={selectedColor}
 *   onSelect={setColor}
 *   columns={8}
 * />
 */
export const ColorPalette: React.FC<{
  colors: string[]
  selectedColor?: string
  onSelect?: (color: string) => void
  columns?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({
  colors,
  selectedColor,
  onSelect,
  columns = 8,
  size = 'md',
  className
}) => {
  return (
    <div 
      className={cn(
        "grid gap-2",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {colors.map((color, index) => (
        <button
          key={index}
          className={cn(
            "relative border-2 border-white shadow-sm hover:scale-110 transition-transform",
            size === 'sm' ? "w-6 h-6" : size === 'md' ? "w-8 h-8" : "w-10 h-10",
            selectedColor === color && "ring-2 ring-primary ring-offset-2"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onSelect?.(color)}
        />
      ))}
    </div>
  )
}

/**
 * ColorInput component - Color input with preview
 * 
 * @param value - Color value
 * @param onChange - Callback when color changes
 * @param placeholder - Input placeholder
 * @param className - Additional CSS classes
 * @returns JSX.Element - Color input
 * 
 * @example
 * <ColorInput 
 *   value={color} 
 *   onChange={setColor}
 *   placeholder="#000000"
 * />
 */
export const ColorInput: React.FC<{
  value?: string
  onChange?: (color: string) => void
  placeholder?: string
  className?: string
}> = ({
  value,
  onChange,
  placeholder = "#000000",
  className
}) => {
  const [isValid, setIsValid] = React.useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    const valid = /^#[0-9A-Fa-f]{0,6}$/.test(color)
    setIsValid(valid)
    
    if (valid) {
      onChange?.(color)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div
        className="w-8 h-8 rounded border-2 border-white shadow-sm"
        style={{ backgroundColor: value || '#000000' }}
      />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "font-mono",
          !isValid && "border-destructive"
        )}
      />
    </div>
  )
}

// Utility functions
function hexToHsla(hex: string): { h: number; s: number; l: number; a: number } {
  let r = 0, g = 0, b = 0, a = 1

  // Handle hex format
  if (hex.startsWith('#')) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      r = parseInt(result[1], 16) / 255
      g = parseInt(result[2], 16) / 255
      b = parseInt(result[3], 16) / 255
    }
  }

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
    a
  }
}

function hslaToHex(h: number, s: number, l: number, a: number): string {
  h = h / 360
  s = s / 100
  l = l / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export { ColorPicker }
