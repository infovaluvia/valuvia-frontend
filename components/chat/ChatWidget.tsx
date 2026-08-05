'use client'

import { useState, useRef, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: Message = {
  role: 'assistant',
  content:
    "Hi! I'm Valuvia's assistant. Ask me anything about how property tax appeals work, pricing, or what's included in your appeal package.",
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || limitReached) return

    const nextMessages = [...messages, { role: 'user', content: text } as Message]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const result = await apiFetch('/api/v1/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(0, -1),
        }),
      })
      setMessages([...nextMessages, { role: 'assistant', content: result.reply }])
      setRemaining(
        typeof result.guest_messages_remaining === 'number' ? result.guest_messages_remaining : null,
      )
    } catch (err) {
      const isLimitError = err instanceof Error && err.message.startsWith('API error 403')
      if (isLimitError) {
        setLimitReached(true)
        setRemaining(0)
        setMessages([
          ...nextMessages,
          {
            role: 'assistant',
            content:
              "You've used your 5 free messages as a guest. Create a free account to keep chatting — it only takes a few seconds.",
          },
        ])
      } else {
        setMessages([
          ...nextMessages,
          {
            role: 'assistant',
            content: "Sorry, I'm having trouble responding right now. Please try again shortly.",
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[70vh] max-h-[480px] w-[calc(100vw-2.5rem)] max-w-[340px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-xl sm:max-w-[380px]">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <p className="text-sm font-semibold text-white">Valuvia Assistant</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/80 hover:text-white"
            >
              <CloseIcon />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-primary text-white'
                    : 'bg-surface-alt text-foreground'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-[var(--radius-md)] bg-surface-alt px-3.5 py-2.5 text-sm text-foreground-muted">
                Thinking…
              </div>
            )}
          </div>

          {limitReached ? (
            <div className="border-t border-border p-3">
              <a
                href="/account/save?from=chat"
                className="flex h-10 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Create free account
              </a>
            </div>
          ) : (
            <>
              <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question…"
                  className="h-10 flex-1 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-tint"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="h-10 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
              {remaining !== null && remaining <= 2 && (
                <p className="border-t border-border bg-surface-alt px-3 py-1.5 text-center text-xs text-foreground-muted">
                  {remaining === 0
                    ? 'Last free message used.'
                    : `${remaining} free guest ${remaining === 1 ? 'message' : 'messages'} left`}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 4h16v12H8l-4 4V4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
