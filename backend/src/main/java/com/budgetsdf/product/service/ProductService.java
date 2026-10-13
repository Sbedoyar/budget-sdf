package com.budgetsdf.product.service;

import com.budgetsdf.common.exception.BusinessException;
import com.budgetsdf.product.dto.request.ProductRequest;
import com.budgetsdf.product.dto.response.ProductResponse;

import java.util.List;

/** Contrato de las operaciones del servicio de productos. */
public interface ProductService {

    /**
     * Crea un producto con stock inicial en cero y una categoría existente.
     *
     * @param request datos validados del producto
     * @return producto creado en formato de respuesta
     * @throws BusinessException si el código ya existe o la categoría no existe
     */
    ProductResponse createProduct(ProductRequest request);

    /**
     * Recupera los productos del catálogo.
     *
     * @param includeInactive indica si también deben incluirse productos inactivos
     * @return productos convertidos al formato de respuesta
     */
    List<ProductResponse> getAllProducts(boolean includeInactive);

    /**
     * Busca un producto por su identificador, incluso si está inactivo.
     *
     * @param id identificador del producto
     * @return producto encontrado
     * @throws BusinessException si el producto no existe
     */
    ProductResponse findById(Long id);

    /**
     * Actualiza los datos descriptivos y la categoría de un producto existente.
     *
     * @param id identificador del producto
     * @param request nuevos datos validados del producto
     * @return producto actualizado
     * @throws BusinessException si el producto, el código único o la categoría no son válidos
     */
    ProductResponse updateProduct(Long id, ProductRequest request);

    /**
     * Elimina físicamente un producto sin historial o lo desactiva cuando
     * existen movimientos asociados que deben conservarse.
     *
     * @param id identificador del producto
     * @return mensaje que indica si el producto fue eliminado o desactivado
     * @throws BusinessException si el producto no existe o ya está inactivo
     */
    String deleteProduct(Long id);

    /**
     * Reactiva un producto previamente desactivado para permitir nuevamente
     * su uso en operaciones de inventario.
     *
     * @param id identificador del producto
     * @return producto reactivado
     * @throws BusinessException si el producto no existe o ya está activo
     */
    ProductResponse reactivateProduct(Long id);
}
