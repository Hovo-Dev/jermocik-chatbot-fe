import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Ask about financial data, market trends, or company analysis...",
  className 
}, ref) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    select: () => inputRef.current?.select(),
    setSelectionRange: (start: number, end: number) => inputRef.current?.setSelectionRange(start, end),
    get value() { return inputRef.current?.value || '' },
    set value(val: string) { if (inputRef.current) inputRef.current.value = val }
  } as HTMLInputElement))

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }


  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus()
    }
  }, [isLoading])

  return (
    <div className={cn('border-t bg-background p-4', className)}>
      <form onSubmit={handleSubmit} className="flex items-end gap-3">

        {/* Main Input Container */}
        <div className="flex-1 relative">
          <div className="relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                'min-h-[40px] resize-none transition-all duration-200',
                'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder:text-gray-500'
              )}
            />
            
          </div>

          {/* Character count */}
          <div className="flex justify-end mt-1 px-1">
            <span className="text-xs text-gray-400">
              {message.length}/2000
            </span>
          </div>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={cn(
            'h-10 px-4 transition-all duration-200',
            'disabled:opacity-50',
            message.trim() && !isLoading && 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90'
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Sending</span>
            </div>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send
            </>
          )}
        </Button>
      </form>

    </div>
  )
})