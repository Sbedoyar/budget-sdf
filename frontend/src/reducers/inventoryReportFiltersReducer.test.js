import { describe, expect, it } from 'vitest'
import { initialInventoryReportFilters, inventoryReportFiltersReducer } from './inventoryReportFiltersReducer'

const emptyFilters = { inventorySearch: '', inventoryStatusFilter: '' }
const selectedFilters = Object.freeze({
  inventorySearch: 'arroz',
  inventoryStatusFilter: 'LOW_STOCK',
})

describe('inventoryReportFiltersReducer', () => {
  it('inicia sin búsqueda ni filtro de stock', () => {
    expect(initialInventoryReportFilters).toStrictEqual(emptyFilters)
  })

  it.each([
    ['inventorySearch', 'café'],
    ['inventoryStatusFilter', 'OUT_OF_STOCK'],
  ])('actualiza %s sin mutar el estado ni borrar el otro criterio', (field, value) => {
    expect(inventoryReportFiltersReducer(selectedFilters, { type: 'SET_FILTER', field, value }))
      .toStrictEqual({ ...selectedFilters, [field]: value })
  })

  it('limpia la búsqueda y el filtro de stock juntos', () => {
    expect(inventoryReportFiltersReducer(selectedFilters, { type: 'RESET_FILTERS' }))
      .toStrictEqual(emptyFilters)
  })

  it('conserva la misma referencia para una acción desconocida', () => {
    expect(inventoryReportFiltersReducer(selectedFilters, { type: 'UNKNOWN' })).toBe(selectedFilters)
  })
})
