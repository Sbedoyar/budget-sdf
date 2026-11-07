export const initialInventoryReportFilters = {
  inventorySearch: '',
  inventoryStatusFilter: '',
}

export function inventoryReportFiltersReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, [action.field]: action.value }
    case 'RESET_FILTERS':
      return initialInventoryReportFilters
    default:
      return state
  }
}
