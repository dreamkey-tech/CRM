'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface CustomSelectOption {
  label: string
  value: string
  subLabel?: string
  icon?: React.ReactNode
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: CustomSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  id?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
  error = false,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Find currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value))

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(optValue)
      setIsOpen(false)
    },
    [onChange]
  )

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between rounded-none bg-surface-elevated px-3 py-2 text-sm transition-all text-left cursor-pointer border ${
          error
            ? 'border-rose-500 text-rose-300'
            : isOpen
            ? 'border-gold ring-1 ring-gold/40 text-foreground'
            : 'border-border text-foreground hover:border-gold/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedOption?.icon && (
            <span className="shrink-0 text-muted-text">{selectedOption.icon}</span>
          )}
          <span className={`truncate ${selectedOption ? 'text-foreground font-medium' : 'text-muted-text/60'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.subLabel && (
            <span className="text-[11px] text-muted-text truncate">
              ({selectedOption.subLabel})
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 shrink-0 text-muted-text transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-gold' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-none border border-border bg-[#18181b] p-1 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100"
          style={{ backgroundColor: '#18181b' }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-text text-center">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = String(option.value) === String(value)
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`flex items-center justify-between px-3 py-2 rounded-none text-xs sm:text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-gold/15 text-gold font-semibold'
                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {option.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-gold' : 'text-muted-text'}`}>
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                    {option.subLabel && (
                      <span
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-gold/80' : 'text-zinc-400'
                        }`}
                      >
                        {option.subLabel}
                      </span>
                    )}
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-gold shrink-0" />}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
