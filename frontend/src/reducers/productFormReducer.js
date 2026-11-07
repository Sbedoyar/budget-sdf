export const initialProductFormState = {
  code: '',
  name: '',
  categoryId: '',
  unitOfMeasure: '',
  minimumStock: '',
  editingId: null,
}

export function productFormReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'LOAD_PRODUCT': {
      const product = action.product

      return {
        code: product.code,
        name: product.name,
        categoryId: String(product.categoryId),
        unitOfMeasure: product.unitOfMeasure,
        minimumStock: String(product.minimumStock),
        editingId: product.id,
      }
    }
    case 'RESET_FORM':
      return { ...initialProductFormState }
    default:
      return state
  }
}
