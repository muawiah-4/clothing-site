import { beforeEach, describe, expect, it } from 'vitest'
import { COLLECTION } from '../data/collection'
import { rehydrateBag, rehydrateWishlist, STORAGE_KEY, useExperienceStore } from './experience'

const nocturne = COLLECTION.find((p) => p.id === 'nocturne')!

function stored() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as {
    state: { bagItems: unknown[]; wishlist: string[] }
    version: number
  }
}

function seed(state: unknown, version = 1) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version }))
}

beforeEach(() => {
  localStorage.clear()
  useExperienceStore.setState({ bagItems: [], wishlist: [] })
})

describe('bag persistence', () => {
  it('writes only ids, sizes and quantities to storage', () => {
    useExperienceStore.getState().addToBag(nocturne, 'M')
    const { state, version } = stored()
    expect(version).toBe(1)
    expect(state.bagItems).toEqual([{ id: 'nocturne', size: 'M', qty: 1 }])
    expect(JSON.stringify(state)).not.toContain('price')
  })

  it('rehydrates a stored bag with pieces from the collection', async () => {
    seed({ bagItems: [{ id: 'nocturne', size: 'L', qty: 2 }], wishlist: [] })
    await useExperienceStore.persist.rehydrate()
    const [line] = useExperienceStore.getState().bagItems
    expect(line.piece).toBe(nocturne)
    expect(line.size).toBe('L')
    expect(line.qty).toBe(2)
  })

  it('ignores a tampered price and re-reads it from COLLECTION', () => {
    const [line] = rehydrateBag([{ id: 'nocturne', size: 'M', qty: 1, piece: { price: 1 }, price: 1 }])
    expect(line.piece.price).toBe(nocturne.price)
  })

  it('drops unknown pieces, unknown sizes and bad quantities; merges duplicates', () => {
    const lines = rehydrateBag([
      { id: 'ghost', size: 'M', qty: 1 },
      { id: 'nocturne', size: 'XXL', qty: 1 },
      { id: 'nocturne', size: 'S', qty: 0 },
      { id: 'nocturne', size: 'S', qty: 'two' },
      { id: 'nocturne', size: 'M', qty: 1 },
      { id: 'nocturne', size: 'M', qty: 2 },
      null,
      'nocturne',
    ])
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({ size: 'M', qty: 3 })
  })

  it('treats a non-array or corrupt payload as an empty bag', async () => {
    expect(rehydrateBag({ nocturne: 1 })).toEqual([])
    localStorage.setItem(STORAGE_KEY, '{not json')
    await useExperienceStore.persist.rehydrate()
    expect(useExperienceStore.getState().bagItems).toEqual([])
  })

  it('starts fresh from an older storage version', async () => {
    seed({ bagItems: [{ id: 'nocturne', size: 'M', qty: 1 }], wishlist: ['nocturne'] }, 0)
    await useExperienceStore.persist.rehydrate()
    expect(useExperienceStore.getState().bagItems).toEqual([])
    expect(useExperienceStore.getState().wishlist).toEqual([])
  })
})

describe('wishlist', () => {
  it('toggles a piece in and out', () => {
    const { toggleWishlist } = useExperienceStore.getState()
    toggleWishlist('nocturne')
    expect(useExperienceStore.getState().wishlist).toEqual(['nocturne'])
    toggleWishlist('nocturne')
    expect(useExperienceStore.getState().wishlist).toEqual([])
  })

  it('removeFromWishlist drops just that piece', () => {
    const { toggleWishlist, removeFromWishlist } = useExperienceStore.getState()
    toggleWishlist('nocturne')
    toggleWishlist('alpine')
    removeFromWishlist('nocturne')
    expect(useExperienceStore.getState().wishlist).toEqual(['alpine'])
  })

  it('persists and rehydrates, dropping unknown and duplicate ids', async () => {
    useExperienceStore.getState().toggleWishlist('alpine')
    expect(stored().state.wishlist).toEqual(['alpine'])

    seed({ bagItems: [], wishlist: ['alpine', 'ghost', 'alpine', 42, 'nocturne'] })
    await useExperienceStore.persist.rehydrate()
    expect(useExperienceStore.getState().wishlist).toEqual(['alpine', 'nocturne'])
    expect(rehydrateWishlist('alpine')).toEqual([])
  })
})
