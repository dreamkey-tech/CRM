'use client'

import React from 'react'
import Image from 'next/image'
import { LoginForm } from '../../components/auth/LoginForm'
import { toast } from '../../utils/toast'

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-surface text-foreground selection:bg-gold/30">
      {/* ── Left Hero Branding Side (Desktop Only) ── */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 relative flex-col justify-between p-10 xl:p-14 text-white overflow-hidden select-none bg-deep-black">
        {/* Background Image with Cinematic Dark Gradient & Blur */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/loginleft.png"
            alt="Luxury Penthouse View"
            fill
            priority
            className="object-cover object-center scale-105"
          />
          {/* Multi-layered dark vignette & gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-black/75 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80" />
        </div>

        {/* Top Badges */}


        {/* Center Main Branding */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
          {/* Golden Key Logo */}
          <div className="relative w-60 sm:w-72 md:w-80 h-24 sm:h-28 md:h-32 mb-1">
            <Image
              src="/logorbg.png"
              alt="DreamKey Logo"
              fill
              priority
              className="object-contain object-center drop-shadow-[0_8px_20px_rgba(212,175,55,0.4)]"
            />
          </div>

          {/* Typography */}
          <h2 className="text-4xl xl:text-5xl font-black tracking-tight text-white uppercase leading-none">
            DREAM<span className="text-gold">KEY</span>
          </h2>

          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="h-px w-6 bg-gold/60" />
            <span className="text-[11px] font-bold tracking-[0.25em] text-gold uppercase whitespace-nowrap">
              UNLOCKING DREAMS
            </span>
            <span className="h-px w-6 bg-gold/60" />
          </div>
        </div>



      </div>

      {/* ── Right Form Container (Desktop & Mobile Fullscreen) ── */}
      <div className="lg:col-span-7 xl:col-span-6 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 bg-surface min-h-screen lg:min-h-full safe-top safe-bottom">
        {/* Top Status Bar (Desktop) */}
        

        {/* Center Login Form */}
        <div className="my-auto py-4 sm:py-6">
          <LoginForm />
        </div>

        {/* Bottom Legal & Security Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center py-2 gap-3 text-xs text-muted-text border-t border-border pt-6 mt-8">
          <p className="text-center sm:text-left">
            © 2025 DreamKeyKol Reality All rights reserved.
          </p>
          
        </div>
      </div>
    </div>
  )
}
