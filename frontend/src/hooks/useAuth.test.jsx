// @vitest-environment jsdom

import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { useAuth } from './useAuth'

afterEach(cleanup)

it('informa que falta AuthProvider cuando el hook se usa fuera del proveedor', () => {
  expect(() => renderHook(useAuth)).toThrow('useAuth must be used within AuthProvider')
})
