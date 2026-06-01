"use client"

import * as React from "react"
import { createContext, useContext, useCallback } from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"


export type ToastVariant = "success" | "error" | "info"

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}


const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-secondary-container text-on-secondary-container border-secondary-container",
  error:   "bg-error-container text-on-error-container border-error-container",
  info:    "bg-surface-container-highest text-on-surface border-border",
}

const VARIANT_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="size-4 shrink-0" />,
  error:   <AlertCircle className="size-4 shrink-0" />,
  info:    <Info className="size-4 shrink-0" />,
}


function ToastProviderInner({ children }: { children: React.ReactNode }) {
  const manager = ToastPrimitive.useToastManager<{ variant: ToastVariant }>()

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      manager.add({ title: message, timeout: 4000, data: { variant } })
    },
    [manager]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport
          className={cn(
            "fixed z-[60] flex flex-col gap-2 outline-none",
            "bottom-20 left-4 right-4",
            "md:bottom-6 md:right-6 md:left-auto md:w-96"
          )}
        >
          {manager.toasts.map((t) => {
            const variant: ToastVariant = (t.data?.variant ?? "info") as ToastVariant
            return (
              <ToastPrimitive.Root
                key={t.id}
                toast={t}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-lg border shadow-lg",
                  "font-body-sm text-body-sm",
                  "data-starting-style:opacity-0 data-starting-style:translate-y-2",
                  "data-ending-style:opacity-0 data-ending-style:translate-y-2",
                  "transition-all duration-300 ease-out",
                  VARIANT_STYLES[variant]
                )}
              >
                {VARIANT_ICONS[variant]}
                <ToastPrimitive.Title className="flex-1 text-sm">
                  {t.title}
                </ToastPrimitive.Title>
                <ToastPrimitive.Close
                  render={<button type="button" />}
                  className="shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Dismiss"
                >
                  <X className="size-3.5" />
                </ToastPrimitive.Close>
              </ToastPrimitive.Root>
            )
          })}
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastContext.Provider>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider timeout={4000} limit={5}>
      <ToastProviderInner>{children}</ToastProviderInner>
    </ToastPrimitive.Provider>
  )
}
