import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useExperienceStore } from '../store/experience'
import { useDevicePerformance } from './useDevicePerformance'

function Probe() {
  useDevicePerformance()
  return null
}

describe('useDevicePerformance', () => {
  let listeners: Array<(e: MediaQueryListEvent) => void>
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    listeners = []
    originalMatchMedia = window.matchMedia
    useExperienceStore.setState({ reducedMotion: false })
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  function mockMatchMedia(matches: boolean) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
  }

  it('reads the current matchMedia(prefers-reduced-motion) value into the store', () => {
    mockMatchMedia(true)
    render(<Probe />)
    expect(useExperienceStore.getState().reducedMotion).toBe(true)
  })

  it('updates the store when the media query change fires', () => {
    mockMatchMedia(false)
    render(<Probe />)
    expect(useExperienceStore.getState().reducedMotion).toBe(false)

    listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent))
    expect(useExperienceStore.getState().reducedMotion).toBe(true)
  })
})
