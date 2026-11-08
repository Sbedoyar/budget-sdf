import { describe, expect, it } from 'vitest'
import {
  emptyMovementFilters,
  initialMovementReportFilters,
  movementReportFiltersReducer,
} from './movementReportFiltersReducer'

const emptyFilters = { period: 'all', from: '', to: '', type: '', productIds: [] }
const draft = Object.freeze({
  period: 'custom',
  from: '2026-10-01',
  to: '2026-10-31',
  type: 'SALIDA',
  productIds: Object.freeze([7, '12']),
})
const applied = Object.freeze({
  ...emptyFilters,
  type: 'ENTRADA',
  productIds: Object.freeze([3]),
})
const state = Object.freeze({
  movementFilters: draft,
  appliedMovementFilters: applied,
  productMovementSearch: 'arroz',
  historySearch: 'compra',
})

describe('movementReportFiltersReducer', () => {
  it('inicia con el período Todo y sin fechas, productos ni búsquedas', () => {
    expect(emptyMovementFilters).toStrictEqual(emptyFilters)
    expect(initialMovementReportFilters).toStrictEqual({
      movementFilters: emptyFilters,
      appliedMovementFilters: emptyFilters,
      productMovementSearch: '',
      historySearch: '',
    })
  })

  it('actualiza el período y las fechas del borrador sin cambiar los filtros aplicados', () => {
    const filters = { period: 'today', from: '2026-11-07', to: '2026-11-07' }
    const result = movementReportFiltersReducer(state, { type: 'UPDATE_DRAFT', filters })

    expect(result).toStrictEqual({ ...state, movementFilters: { ...draft, ...filters } })
  })

  it('permite volver a todos los productos sin perder los otros criterios del borrador', () => {
    const result = movementReportFiltersReducer(state, {
      type: 'UPDATE_DRAFT',
      filters: { productIds: [] },
    })

    expect(result).toStrictEqual({ ...state, movementFilters: { ...draft, productIds: [] } })
  })

  it('agrega un producto al borrador conservando el tipo de su identificador', () => {
    const result = movementReportFiltersReducer(state, { type: 'TOGGLE_PRODUCT', productId: '25' })

    expect(result).toStrictEqual({
      ...state,
      movementFilters: { ...draft, productIds: [7, '12', '25'] },
    })
  })

  it.each([
    ['7', ['12']],
    [12, [7]],
  ])('quita el producto %j aunque su identificador se exprese con otro tipo', (productId, remaining) => {
    const result = movementReportFiltersReducer(state, { type: 'TOGGLE_PRODUCT', productId })

    expect(result).toStrictEqual({ ...state, movementFilters: { ...draft, productIds: remaining } })
  })

  it.each(['productMovementSearch', 'historySearch'])('limpia %s sin cambiar los demás criterios', (field) => {
    const result = movementReportFiltersReducer(state, { type: 'SET_RESULT_SEARCH', field, value: '' })

    expect(result).toStrictEqual({ ...state, [field]: '' })
  })

  it('restablece el borrador sin alterar la consulta aplicada ni las búsquedas', () => {
    const result = movementReportFiltersReducer(state, { type: 'RESET_DRAFT' })

    expect(result).toStrictEqual({ ...state, movementFilters: emptyFilters })
  })

  it('aplica los filtros de la consulta, copia sus productos y limpia ambas búsquedas', () => {
    const submitted = { ...draft, type: 'ENTRADA', productIds: [3, '12'] }
    const result = movementReportFiltersReducer(state, { type: 'APPLY_FILTERS', filters: submitted })
    submitted.productIds.push(99)

    expect(result).toStrictEqual({
      ...state,
      appliedMovementFilters: { ...submitted, productIds: [3, '12'] },
      productMovementSearch: '',
      historySearch: '',
    })
  })

  it('aplica una consulta sin identificadores de producto con una lista vacía', () => {
    const filters = { period: 'all', from: '', to: '', type: '' }
    const result = movementReportFiltersReducer(state, { type: 'APPLY_FILTERS', filters })

    expect(result.appliedMovementFilters).toStrictEqual({ ...filters, productIds: [] })
  })

  it('conserva la misma referencia para una acción desconocida', () => {
    expect(movementReportFiltersReducer(state, { type: 'UNKNOWN' })).toBe(state)
  })
})
