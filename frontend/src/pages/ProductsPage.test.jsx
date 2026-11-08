// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getCategories } from '../services/categoryService'
import { createProduct, getProducts, updateProduct } from '../services/productService'
import ProductsPage from './ProductsPage'

vi.mock('../services/categoryService', () => ({ getCategories: vi.fn() }))
vi.mock('../services/productService', () => ({
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getProducts: vi.fn(),
  reactivateProduct: vi.fn(),
  updateProduct: vi.fn(),
}))

const product = {
  id: 7,
  code: 'P007',
  name: 'Arroz',
  category: 'Alimentos',
  categoryId: 2,
  unitOfMeasure: 'Bolsa',
  minimumStock: 3,
  currentStock: 10,
  active: true,
}

beforeEach(() => {
  getCategories.mockResolvedValue([{ id: 2, name: 'Alimentos' }])
  getProducts.mockResolvedValue([product])
})

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

it.each([5, 0])('crea un producto con stock mínimo %i', async (minimumStock) => {
  const payload = {
    code: 'P008',
    name: 'Lentejas',
    categoryId: 2,
    unitOfMeasure: 'Bolsa',
    minimumStock,
  }
  createProduct.mockResolvedValue(undefined)
  getProducts.mockResolvedValueOnce([product]).mockResolvedValueOnce([
    product,
    { ...product, ...payload, id: 8, currentStock: 0 },
  ])

  render(<ProductsPage />)
  await screen.findByRole('button', { name: 'Editar Arroz' })

  const codeInput = screen.getByLabelText('Código')
  codeInput.scrollIntoView = vi.fn()
  fireEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }))
  await waitFor(() => expect(document.activeElement).toBe(codeInput))

  fireEvent.change(codeInput, { target: { value: ' P008 ' } })
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: ' Lentejas ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Categoría' }))
  fireEvent.click(screen.getByRole('option', { name: 'Alimentos' }))
  fireEvent.change(screen.getByLabelText('Unidad de medida'), { target: { value: ' Bolsa ' } })
  fireEvent.change(screen.getByLabelText('Stock mínimo'), { target: { value: String(minimumStock) } })
  fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }))

  expect(createProduct).toHaveBeenCalledExactlyOnceWith(payload)
  expect(await screen.findByText('Producto creado correctamente')).toBeTruthy()
  expect(await screen.findByRole('button', { name: 'Editar Lentejas' })).toBeTruthy()
  expect(codeInput.value).toBe('')
})

it('precarga, enfoca y guarda la edición de un producto', async () => {
  updateProduct.mockResolvedValue(undefined)
  getProducts.mockResolvedValueOnce([product]).mockResolvedValueOnce([
    { ...product, name: 'Arroz integral' },
  ])

  render(<ProductsPage />)
  const codeInput = screen.getByLabelText('Código')
  codeInput.scrollIntoView = vi.fn()
  fireEvent.click(await screen.findByRole('button', { name: 'Editar Arroz' }))

  await waitFor(() => expect(document.activeElement).toBe(codeInput))
  expect(codeInput.value).toBe('P007')
  expect(screen.getByLabelText('Stock mínimo').value).toBe('3')
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Arroz integral' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

  expect(updateProduct).toHaveBeenCalledExactlyOnceWith(7, {
    code: 'P007',
    name: 'Arroz integral',
    categoryId: 2,
    unitOfMeasure: 'Bolsa',
    minimumStock: 3,
  })
  expect(await screen.findByText('Producto actualizado correctamente')).toBeTruthy()
  expect(await screen.findByRole('button', { name: 'Editar Arroz integral' })).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Registrar producto' })).toBeTruthy()
})

it('descarta los cambios al cancelar la edición', async () => {
  render(<ProductsPage />)
  const codeInput = screen.getByLabelText('Código')
  codeInput.scrollIntoView = vi.fn()
  fireEvent.click(await screen.findByRole('button', { name: 'Editar Arroz' }))
  await waitFor(() => expect(document.activeElement).toBe(codeInput))

  const nameInput = screen.getByLabelText('Nombre')
  fireEvent.change(nameInput, { target: { value: 'Cambio sin guardar' } })
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(screen.getByRole('heading', { name: 'Registrar producto' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Editar Arroz' })).toBeTruthy()
  expect(codeInput.value).toBe('')
  expect(nameInput.value).toBe('')
  expect(screen.getByLabelText('Stock mínimo').value).toBe('')
  expect(updateProduct).not.toHaveBeenCalled()
  expect(createProduct).not.toHaveBeenCalled()
})
