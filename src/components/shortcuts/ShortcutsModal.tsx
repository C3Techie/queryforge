"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { SHORTCUTS } from "@/lib/constants"
import { cn } from "@/lib/utils"


function KeyBadge({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-1.5 rounded border border-border bg-surface-container font-code-sm text-code-sm text-on-surface shadow-sm">
      {label}
    </kbd>
  )
}

interface ShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ShortcutsModal
export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />

        {/* Panel */}
        <Dialog.Popup className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "mx-4 sm:mx-0",
          "bg-surface-container-lowest border border-border rounded-xl shadow-xl",
          "flex flex-col gap-0 overflow-hidden",
          "transition-all duration-200",
          "data-starting-style:opacity-0 data-starting-style:scale-95",
          "data-ending-style:opacity-0 data-ending-style:scale-95"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-bright">
            <div>
              <Dialog.Title className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Keyboard Shortcuts
              </Dialog.Title>
              <Dialog.Description className="font-body-sm text-body-sm text-muted-foreground mt-0.5">
                Speed up your workflow with these shortcuts.
              </Dialog.Description>
            </div>
            <Dialog.Close
              render={<button />}
              className="p-1.5 rounded text-muted-foreground hover:text-on-surface hover:bg-surface-container transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {/* Shortcut list */}
          <div className="px-5 py-4 flex flex-col gap-1">
            {SHORTCUTS.map((s) => (
              <div
                key={s.action}
                className={cn(
                  "flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors",
                  s.available
                    ? "hover:bg-surface-container"
                    : "opacity-40"
                )}
              >
                <span className={cn(
                  "font-body-md text-body-md",
                  s.available ? "text-on-surface" : "text-muted-foreground"
                )}>
                  {s.action}
                  {!s.available && (
                    <span className="ml-2 text-[10px] font-label-caps text-label-caps uppercase tracking-wider text-muted-foreground bg-surface-container px-1.5 py-0.5 rounded-full">
                      soon
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  {s.keys.map((key, i) => (
                    <React.Fragment key={key}>
                      <KeyBadge label={key} />
                      {i < s.keys.length - 1 && (
                        <span className="text-xs text-muted-foreground">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border bg-surface-container-low">
            <p className="font-body-sm text-body-sm text-muted-foreground text-center">
              Press <KeyBadge label="?" /> anywhere to toggle this panel
            </p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
