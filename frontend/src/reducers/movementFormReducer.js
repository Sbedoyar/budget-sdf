export const initialMovementFormState = {
  productId: '',
  type: '',
  quantity: '',
  observation: '',
}

export function movementFormReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET_FORM':
      return { ...initialMovementFormState }
    default:
      return state
  }
}
