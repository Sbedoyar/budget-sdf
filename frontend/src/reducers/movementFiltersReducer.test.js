import { describe, expect, it } from 'vitest'
import { initialMovementFiltersState, movementFiltersReducer } from './movementFiltersReducer'

const emptyFilters = { searchTerm: '', typeFilter: '', productFilter: '' }
const selectedFilters = Object.freeze({
  searchTerm: 'compra',
  typeFilter: 'ENTRADA',
  productFilter: '7',
})

describe('movementFiltersReducer', () => {
  it('inicia sin criterios para el historial', () => {
    expect(initialMovementFiltersState).toStrictEqual(emptyFilters)
  })

  it.each([
    ['searchTerm', 'ajuste'],
    ['typeFilter', 'SALIDA'],
    ['productFilter', '12'],
  ])('actualiza %s sin mutar ni borrar los demás filtros', (field, value) => {
    expect(movementFiltersReducer(selectedFilters, { type: 'SET_FILTER', field, value }))
      .toStrictEqual({ ...selectedFilters, [field]: value })
  })

  it('limpia todos los criterios del historial', () => {
    expect(movementFiltersReducer(selectedFilters, { type: 'RESET_FILTERS' }))
      .toStrictEqual(emptyFilters)
  })

  it('conserva la misma referencia para una acción desconocida', () => {
    expect(movementFiltersReducer(selectedFilters, { type: 'UNKNOWN' })).toBe(selectedFilters)
  })
})
