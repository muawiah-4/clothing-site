import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useFocusTrap } from './useFocusTrap'

function Panel({ open }: { open: boolean }) {
  const ref = useFocusTrap(open, () => {})
  return (
    <div ref={ref}>
      <button>first</button>
      <button>middle</button>
      <button>last</button>
    </div>
  )
}

// unmount between tests so earlier panels' keydown listeners don't also react
afterEach(cleanup)

describe('useFocusTrap: Tab wrap', () => {
  it('wraps focus from the last item to the first on Tab', () => {
    render(<Panel open />)
    const last = document.querySelector<HTMLButtonElement>('button:last-of-type')!
    const first = document.querySelector<HTMLButtonElement>('button:first-of-type')!
    last.focus()
    expect(document.activeElement).toBe(last)

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    window.dispatchEvent(event)

    expect(document.activeElement).toBe(first)
  })

  it('wraps focus from the first item to the last on Shift+Tab', () => {
    render(<Panel open />)
    const last = document.querySelector<HTMLButtonElement>('button:last-of-type')!
    const first = document.querySelector<HTMLButtonElement>('button:first-of-type')!
    first.focus()
    expect(document.activeElement).toBe(first)

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
    window.dispatchEvent(event)

    expect(document.activeElement).toBe(last)
  })
})

describe('useFocusTrap: focus return', () => {
  it('returns focus to a clicked trigger that never took focus (Safari)', () => {
    ;(document.activeElement as HTMLElement | null)?.blur()
    const trigger = document.createElement('button')
    trigger.textContent = 'open'
    document.body.appendChild(trigger)
    // Safari: a mouse press on a <button> leaves focus on <body>
    trigger.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(document.activeElement).toBe(document.body)

    const { rerender } = render(<Panel open />)
    expect(document.activeElement?.textContent).toBe('first')
    rerender(<Panel open={false} />)

    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })
})

describe('useFocusTrap: Tab never leaves the panel', () => {
  it('moves focus to the next item itself (Safari Tab skips buttons)', () => {
    render(<Panel open />)
    const buttons = document.querySelectorAll<HTMLButtonElement>('button')
    buttons[0].focus()
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(buttons[1])
  })
})
