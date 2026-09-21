import { useEffect, useState } from 'react'
import {
  createMovement,
  getMovements,
} from '../services/movementService'
import { getProducts } from '../services/productService'

function MovementsPage() {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])

  const [productId, setProductId] = useState('')
  const [type, setType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [observation, setObservation] = useState('')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadMovements = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getMovements()
      setMovements(data)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible cargar los movimientos',
      )
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible cargar los productos',
      )
    }
  }

    useEffect(() => {
        let cancelled = false

        const fetchInitialData = async () => {
            try {
            const [movementsData, productsData] = await Promise.all([
                getMovements(),
                getProducts(),
            ])

            if (!cancelled) {
                setMovements(movementsData)
                setProducts(productsData)
            }
            } catch (error) {
            if (!cancelled) {
                setError(
                error.response?.data?.message ||
                    'No fue posible cargar los datos',
                )
            }
            } finally {
            if (!cancelled) {
                setLoading(false)
            }
            }
        }

        fetchInitialData()

        return () => {
            cancelled = true
        }
        }, [])

  const resetForm = () => {
    setProductId('')
    setType('')
    setQuantity('')
    setObservation('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')
    setSaving(true)

    const movement = {
      productId: Number(productId),
      type,
      quantity: Number(quantity),
      observation,
    }

    try {
      const data = await createMovement(movement)

      setMessage(
        `Movimiento registrado correctamente. Stock resultante: ${data.resultingStock}`,
      )

      resetForm()

      await loadMovements()
      await loadProducts()
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'No fue posible registrar el movimiento',
      )
    } finally {
      setSaving(false)
    }
  }

  const selectedProduct = products.find(
    (product) => product.id === Number(productId),
  )

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Movimientos</h2>

        <p className="page-subtitle">
          Registra entradas y salidas de inventario.
        </p>
      </div>

      <section className="card">
        <form onSubmit={handleSubmit}>
          <div className="movement-form-grid">
            <div className="form-group">
              <label htmlFor="product" className="form-label">
                Producto
              </label>

              <select
                id="product"
                className="form-input"
                value={productId}
                onChange={(event) =>
                  setProductId(event.target.value)
                }
                required
              >
                <option value="">Selecciona un producto</option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <p className="stock-info">
                  Stock actual: {selectedProduct.currentStock}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Tipo de movimiento
              </label>

              <select
                id="type"
                className="form-input"
                value={type}
                onChange={(event) => setType(event.target.value)}
                required
              >
                <option value="">Selecciona un tipo</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity" className="form-label">
                Cantidad
              </label>

              <input
                id="quantity"
                className="form-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="observation" className="form-label">
                Observación
              </label>

              <input
                id="observation"
                className="form-input"
                type="text"
                value={observation}
                onChange={(event) =>
                  setObservation(event.target.value)
                }
                placeholder="Ej: Compra a proveedor"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >
              {saving ? 'Registrando...' : 'Registrar movimiento'}
            </button>
          </div>
        </form>

        {error && <p className="message-error">{error}</p>}

        {message && (
          <p className="message-success">{message}</p>
        )}
      </section>

      <div className="table-container">
        {loading ? (
          <p>Cargando movimientos...</p>
        ) : movements.length === 0 ? (
          <p>No hay movimientos registrados.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock resultante</th>
                <th>Observación</th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td>
                    {new Date(movement.date).toLocaleString()}
                  </td>

                  <td>{movement.productName}</td>

                  <td>
                    <span
                      className={
                        movement.type === 'ENTRADA'
                          ? 'movement-badge movement-entry'
                          : 'movement-badge movement-exit'
                      }
                    >
                      {movement.type}
                    </span>
                  </td>

                  <td>{movement.quantity}</td>
                  <td>{movement.resultingStock}</td>
                  <td>{movement.observation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default MovementsPage