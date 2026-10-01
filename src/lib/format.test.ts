import { describe, expect, it } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('formats a whole-dollar USD amount with thousands separators and no decimals', () => {
    expect(formatPrice(1450)).toBe('$1,450')
  })

  it('rounds to the nearest dollar', () => {
    expect(formatPrice(99.6)).toBe('$100')
  })
})
