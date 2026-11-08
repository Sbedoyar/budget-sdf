import { describe, expect, it } from 'vitest'
import { getErrorMessage } from './getErrorMessage'

const fallbackMessage = 'No fue posible completar la operación'

describe('getErrorMessage', () => {
  it('devuelve el mensaje válido del backend antes que el alternativo', () => {
    const error = { response: { data: { message: 'El producto no existe' } } }

    expect(getErrorMessage(error, fallbackMessage)).toBe('El producto no existe')
  })

  it('conserva exactamente el mensaje del backend, incluidos sus espacios', () => {
    const message = '  El código ya está registrado  '
    const error = { response: { data: { message } } }

    expect(getErrorMessage(error, fallbackMessage)).toBe(message)
  })

  it('muestra el mensaje de conexión en español cuando Axios no recibe respuesta', () => {
    const error = { code: 'ERR_NETWORK', message: 'Network Error' }

    expect(getErrorMessage(error, fallbackMessage)).toBe(
      'No fue posible conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.',
    )
  })

  it('usa el mensaje alternativo cuando la respuesta HTTP no incluye un mensaje', () => {
    const error = { response: { status: 500, data: {} } }

    expect(getErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })

  it('usa el mensaje alternativo cuando no hay respuesta ni código de red', () => {
    const error = { message: 'Error inesperado' }

    expect(getErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })

  it.each(['', '   '])('usa el mensaje alternativo para el mensaje vacío %j', (message) => {
    const error = { response: { data: { message } } }

    expect(getErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })

  it('usa el mensaje alternativo cuando el backend devuelve un objeto como mensaje', () => {
    const error = { response: { data: { message: { detail: 'Error de validación' } } } }

    expect(getErrorMessage(error, fallbackMessage)).toBe(fallbackMessage)
  })
})
