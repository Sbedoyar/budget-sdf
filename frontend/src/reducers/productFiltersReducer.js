export const initialProductFiltersState = {
  searchTerm: '',
  categoryFilter: '',
  stockFilter: '',
  activityFilter: 'ACTIVE',
}

export function productFiltersReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.field]: action.value }
    case 'RESET_FILTERS':
      return { ...initialProductFiltersState }
    default:
      return state
  }
}
