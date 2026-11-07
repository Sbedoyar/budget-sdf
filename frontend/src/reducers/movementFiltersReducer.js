export const initialMovementFiltersState = {
  searchTerm: '',
  typeFilter: '',
  productFilter: '',
}

export function movementFiltersReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.field]: action.value }
    case 'RESET_FILTERS':
      return { ...initialMovementFiltersState }
    default:
      return state
  }
}
