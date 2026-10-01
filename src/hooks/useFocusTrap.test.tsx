import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
