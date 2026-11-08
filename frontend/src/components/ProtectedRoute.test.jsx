// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from '../contexts/AuthProvider'
import ProtectedRoute from './ProtectedRoute'

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderPrivateRoute() {
  const renderPrivateContent = vi.fn(() => <h1>Panel privado</h1>)
  const PrivateContent = renderPrivateContent

  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<h1>Iniciar sesión</h1>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><PrivateContent /></ProtectedRoute>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )

  return renderPrivateContent
}

describe('ProtectedRoute', () => {
  it('muestra el panel privado con la sesión restaurada', () => {
    localStorage.setItem('token', 'jwt-de-prueba')
    localStorage.setItem('username', 'ana')
    localStorage.setItem('role', 'PROPIETARIO')

    renderPrivateRoute()

    expect(screen.getByRole('heading', { name: 'Panel privado' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Iniciar sesión' })).toBeNull()
  })

  it('redirige a /login sin montar el contenido privado si no hay sesión', async () => {
    const renderPrivateContent = renderPrivateRoute()

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Panel privado' })).toBeNull()
    expect(renderPrivateContent).not.toHaveBeenCalled()
  })
})
