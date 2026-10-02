import { describe, expect, it } from 'vitest'
import { COLLECTION } from './collection'

describe('COLLECTION data integrity', () => {
  it('has a unique id for every piece', () => {
    const ids = COLLECTION.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses valid gender values', () => {
    for (const piece of COLLECTION) {
      expect(['men', 'women']).toContain(piece.gender)
    }
  })

  it('prices every piece above zero', () => {
    for (const piece of COLLECTION) {
      expect(piece.price).toBeGreaterThan(0)
    }
  })
})
