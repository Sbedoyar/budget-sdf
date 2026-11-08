import { describe, expect, it } from 'vitest'
import { initialProductFormState, productFormReducer } from './productFormReducer'

const emptyForm = {
  code: '',
  name: '',
  categoryId: '',
  unitOfMeasure: '',
  minimumStock: '',
  editingId: null,
}

const product = Object.freeze({
  id: 7,
  code: 'P007',
  name: 'Arroz',
  categoryId: 3,
  unitOfMeasure: 'Bolsa',
  minimumStock: 5,
  currentStock: 24,
})

const editingForm = Object.freeze({
  code: 'P007',
  name: 'Arroz',
  categoryId: '3',
  unitOfMeasure: 'Bolsa',
  minimumStock: '5',
  editingId: 7,
})

describe('productFormReducer', () => {
  it('inicia con los campos vacíos y sin un producto en edición', () => {
    expect(initialProductFormState).toStrictEqual(emptyForm)
  })

  it.each([
    ['code', 'P008'],
    ['name', 'Arroz integral'],
    ['categoryId', '4'],
    ['unitOfMeasure', 'Caja'],
    ['minimumStock', '0'],
  ])('actualiza %s sin mutar el formulario ni salir de la edición', (field, value) => {
    const result = productFormReducer(editingForm, { type: 'SET_FIELD', field, value })

    expect(result).toStrictEqual({ ...editingForm, [field]: value })
  })

  it('carga el producto para editar con los valores numéricos en texto y sin stock actual', () => {
    const state = Object.freeze({ ...initialProductFormState })
    const result = productFormReducer(state, { type: 'LOAD_PRODUCT', product })

    expect(result).toStrictEqual(editingForm)
  })

  it('conserva el stock mínimo cero como texto al cargar un producto', () => {
    const result = productFormReducer(initialProductFormState, {
      type: 'LOAD_PRODUCT',
      product: { ...product, minimumStock: 0 },
    })

    expect(result.minimumStock).toBe('0')
  })

  it('limpia todos los campos y sale de la edición al restablecer', () => {
    const result = productFormReducer(editingForm, { type: 'RESET_FORM' })

    expect(result).toStrictEqual(emptyForm)
  })

  it('devuelve el mismo estado para una acción desconocida', () => {
    expect(productFormReducer(editingForm, { type: 'UNKNOWN' })).toBe(editingForm)
  })
})
