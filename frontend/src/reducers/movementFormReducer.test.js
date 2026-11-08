import { describe, expect, it } from 'vitest'
import { initialMovementFormState, movementFormReducer } from './movementFormReducer'

const emptyForm = { productId: '', type: '', quantity: '', observation: '' }
const filledForm = Object.freeze({
  productId: '7',
  type: 'ENTRADA',
  quantity: '3',
  observation: 'Compra',
})

describe('movementFormReducer', () => {
  it('inicia sin producto, tipo, cantidad ni observación', () => {
    expect(initialMovementFormState).toStrictEqual(emptyForm)
  })

  it.each([
    ['productId', '12'],
    ['type', 'SALIDA'],
    ['quantity', '6'],
    ['observation', 'Ajuste'],
  ])('actualiza %s sin mutar ni borrar los demás campos', (field, value) => {
    expect(movementFormReducer(filledForm, { type: 'SET_FIELD', field, value }))
      .toStrictEqual({ ...filledForm, [field]: value })
  })

  it('restablece todos los campos del formulario', () => {
    expect(movementFormReducer(filledForm, { type: 'RESET_FORM' })).toStrictEqual(emptyForm)
  })

  it('conserva la misma referencia para una acción desconocida', () => {
    expect(movementFormReducer(filledForm, { type: 'UNKNOWN' })).toBe(filledForm)
  })
})
