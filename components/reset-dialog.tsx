'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RotateCcw, AlertTriangle } from 'lucide-react'

interface ResetDialogProps {
  onReset: () => void
  friendCount: number
}

export function ResetDialog({ onReset, friendCount }: ResetDialogProps) {
  const [open, setOpen] = useState(false)

  const handleReset = () => {
    onReset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="spring-transition text-destructive hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          reset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>reset all friends</span>
          </DialogTitle>
          <DialogDescription>
            this will permanently delete all {friendCount} friends from your orbit. 
            this action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            reset all friends
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
