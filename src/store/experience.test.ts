import { beforeEach, describe, expect, it } from 'vitest'
import type { CollectionPiece } from '../data/collection'
import { useExperienceStore } from './experience'

function piece(id: string): CollectionPiece {
  return {
    id,
    name: `Piece ${id}`,
    category: 'Tailoring',
    gender: 'women',
    index: '01',
    price: 100,
    image: 'https://example.com/photo',
    fabric: 'wool',
    fit: 'slim',
    care: 'dry clean',
    objectPosition: '50% 50%',
    gallery: [],
  }
}

describe('experience store: bag', () => {
  beforeEach(() => {
    useExperienceStore.setState({ bagItems: [] })
  })

  it('addToBag merges by id+size, incrementing qty instead of duplicating the line', () => {
    const { addToBag } = useExperienceStore.getState()
    addToBag(piece('nocturne'), 'M')
    addToBag(piece('nocturne'), 'M')
    const { bagItems } = useExperienceStore.getState()
    expect(bagItems).toHaveLength(1)
    expect(bagItems[0].qty).toBe(2)
  })

  it('addToBag with a different size creates a separate line', () => {
    const { addToBag } = useExperienceStore.getState()
    addToBag(piece('nocturne'), 'M')
    addToBag(piece('nocturne'), 'L')
    const { bagItems } = useExperienceStore.getState()
    expect(bagItems).toHaveLength(2)
    expect(bagItems.map((i) => i.size).sort()).toEqual(['L', 'M'])
  })

  it('removeFromBag drops only the matching id+size line', () => {
    const { addToBag, removeFromBag } = useExperienceStore.getState()
    addToBag(piece('nocturne'), 'M')
    addToBag(piece('nocturne'), 'L')
    removeFromBag('nocturne', 'M')
    const { bagItems } = useExperienceStore.getState()
    expect(bagItems).toHaveLength(1)
    expect(bagItems[0].size).toBe('L')
  })

  it('setQty to 0 or below removes the line', () => {
    const { addToBag, setQty } = useExperienceStore.getState()
    addToBag(piece('nocturne'), 'M')
    setQty('nocturne', 'M', 0)
    expect(useExperienceStore.getState().bagItems).toHaveLength(0)
  })

  it('clearBag empties every line', () => {
    const { addToBag, clearBag } = useExperienceStore.getState()
    addToBag(piece('nocturne'), 'M')
    addToBag(piece('colonnade'), 'L')
    clearBag()
    expect(useExperienceStore.getState().bagItems).toEqual([])
  })
})
