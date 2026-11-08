import { describe, expect, it } from 'vitest'
import { initialProductFiltersState, productFiltersReducer } from './productFiltersReducer'

const defaultFilters = {
  searchTerm: '',
  categoryFilter: '',
  stockFilter: '',
  activityFilter: 'ACTIVE',
}

const selectedFilters = Object.freeze({
  searchTerm: 'arroz',
  categoryFilter: '3',
  stockFilter: 'LOW_STOCK',
  activityFilter: 'INACTIVE',
})

describe('productFiltersReducer', () => {
  it('inicia sin búsqueda, categoría ni stock y muestra productos activos', () => {
    expect(initialProductFiltersState).toStrictEqual(defaultFilters)
  })

  it.each([
    ['searchTerm', 'café'],
    ['categoryFilter', '4'],
    ['stockFilter', 'OUT_OF_STOCK'],
    ['activityFilter', 'ALL'],
  ])('actualiza %s sin mutar los filtros ni descartar otros criterios', (field, value) => {
    const result = productFiltersReducer(selectedFilters, { type: 'SET_FILTER', field, value })

    expect(result).toStrictEqual({ ...selectedFilters, [field]: value })
  })

  it('limpia todos los filtros y vuelve a mostrar solo productos activos', () => {
    const result = productFiltersReducer(selectedFilters, { type: 'RESET_FILTERS' })

    expect(result).toStrictEqual(defaultFilters)
  })

  it('devuelve los mismos filtros para una acción desconocida', () => {
    expect(productFiltersReducer(selectedFilters, { type: 'UNKNOWN' })).toBe(selectedFilters)
  })
})
