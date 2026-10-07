'use client'

import React from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[#171717] group-[.toaster]:text-[#F8F8F6] group-[.toaster]:border-[#262626] group-[.toaster]:shadow-2xl group-[.toaster]:shadow-black/90 group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:text-xs group-[.toaster]:font-sans',
          title: 'group-[.toast]:font-semibold group-[.toast]:text-[#F8F8F6] group-[.toast]:text-xs',
          description: 'group-[.toast]:text-[#9CA3AF] group-[.toast]:text-[11px] group-[.toast]:mt-1 leading-relaxed',
          actionButton:
            'group-[.toast]:bg-[#D4AF37] group-[.toast]:text-[#0B0B0B] group-[.toast]:font-bold group-[.toast]:rounded-lg group-[.toast]:text-xs hover:group-[.toast]:bg-[#E6C75A]',
          cancelButton:
            'group-[.toast]:bg-[#111111] group-[.toast]:text-[#9CA3AF] group-[.toast]:rounded-lg group-[.toast]:text-xs',
          closeButton:
            'group-[.toast]:bg-[#111111] group-[.toast]:text-[#9CA3AF] group-[.toast]:border-[#262626] hover:group-[.toast]:text-[#F8F8F6] hover:group-[.toast]:bg-[#262626]',
          info:
            'group-[.toaster]:border-[#D4AF37]/50 group-[.toaster]:bg-[#171717] group-[.toaster]:text-[#F8F8F6] [&_[data-icon]]:text-[#D4AF37]',
          success:
            'group-[.toaster]:border-emerald-600/50 group-[.toaster]:bg-[#171717] group-[.toaster]:text-[#F8F8F6] [&_[data-icon]]:text-emerald-400',
          error:
            'group-[.toaster]:border-rose-600/50 group-[.toaster]:bg-[#171717] group-[.toaster]:text-[#F8F8F6] [&_[data-icon]]:text-rose-400',
          warning:
            'group-[.toaster]:border-amber-500/50 group-[.toaster]:bg-[#171717] group-[.toaster]:text-[#F8F8F6] [&_[data-icon]]:text-amber-400',
        },
      }}
      {...props}
    />
  )
}
