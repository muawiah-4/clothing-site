import { describe, expect, it } from 'vitest'
import { COLLECTION } from '../data/collection'
import { queryCollection, type CollectionQuery } from './collection-query'
import { pieceStockStatus } from '../hooks/useStock'

const base: CollectionQuery = { gender: 'all', category: 'all', search: '', sort: 'featured' }
const ids = (q: Partial<CollectionQuery>) => queryCollection(COLLECTION, { ...base, ...q }).map((p) => p.id)

describe('queryCollection', () => {
  it('returns the curated order by default', () => {
    expect(ids({})).toEqual(COLLECTION.map((p) => p.id))
  })

  it('filters by gender and category', () => {
    const result = queryCollection(COLLECTION, { ...base, gender: 'women', category: 'Eveningwear' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((p) => p.gender === 'women' && p.category === 'Eveningwear')).toBe(true)
  })

  it('searches name, category and fabric, case- and accent-insensitively', () => {
    expect(ids({ search: 'NOCTURNE' })).toEqual(['nocturne'])
    expect(ids({ search: 'outerwear' })).toEqual(
      COLLECTION.filter((p) => p.category === 'Outerwear').map((p) => p.id),
    )
    expect(ids({ search: 'crepe' })).toContain('aubergine-drape') // "crêpe"
    expect(ids({ search: 'shearling' })).toEqual(['alpine'])
  })

  it('requires every search term to match', () => {
    expect(ids({ search: 'silk gown' })).toEqual(['liquid-silk'])
    expect(ids({ search: 'silk tuxedo' })).toEqual([])
  })

  it('sorts by price both ways', () => {
    const asc = queryCollection(COLLECTION, { ...base, sort: 'price-asc' }).map((p) => p.price)
    const desc = queryCollection(COLLECTION, { ...base, sort: 'price-desc' }).map((p) => p.price)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    expect(desc).toEqual([...asc].reverse())
  })

  it('does not mutate the input', () => {
    const copy = [...COLLECTION]
    queryCollection(COLLECTION, { ...base, sort: 'price-desc' })
    expect(COLLECTION).toEqual(copy)
  })
})

describe('pieceStockStatus', () => {
  it('flags sold out, low and normal stock; stays silent when unknown', () => {
    expect(pieceStockStatus([0, 0, 0])).toBe('sold-out')
    expect(pieceStockStatus([0, 2, 3])).toBe('low')
    expect(pieceStockStatus([0, 2, 9])).toBeNull()
    expect(pieceStockStatus([null, 0, 0])).toBeNull()
    expect(pieceStockStatus([])).toBeNull()
  })
})
