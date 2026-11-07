export const emptyMovementFilters = {
  period: 'all',
  from: '',
  to: '',
  type: '',
  productIds: [],
}

export const initialMovementReportFilters = {
  movementFilters: emptyMovementFilters,
  appliedMovementFilters: emptyMovementFilters,
  productMovementSearch: '',
  historySearch: '',
}

export function movementReportFiltersReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DRAFT':
      return {
        ...state,
        movementFilters: { ...state.movementFilters, ...action.filters },
      }
    case 'TOGGLE_PRODUCT': {
      const { productIds } = state.movementFilters
      const { productId } = action
      const isSelected = productIds.some(
        (selectedId) => String(selectedId) === String(productId),
      )

      return {
        ...state,
        movementFilters: {
          ...state.movementFilters,
          productIds: isSelected
            ? productIds.filter((selectedId) => String(selectedId) !== String(productId))
            : [...productIds, productId],
        },
      }
    }
    case 'RESET_DRAFT':
      return { ...state, movementFilters: emptyMovementFilters }
    case 'SET_RESULT_SEARCH':
      return { ...state, [action.field]: action.value }
    case 'APPLY_FILTERS':
      return {
        ...state,
        appliedMovementFilters: {
          ...action.filters,
          productIds: [...(action.filters.productIds || [])],
        },
        productMovementSearch: '',
        historySearch: '',
      }
    default:
      return state
  }
}
