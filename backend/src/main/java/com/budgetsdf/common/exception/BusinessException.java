package com.budgetsdf.common.exception;

/**
 * Excepción para comunicar incumplimientos de reglas de negocio a la capa HTTP.
 */
public class BusinessException extends RuntimeException {

    /**
     * Crea una excepción de negocio con el mensaje que se devolverá al cliente.
     *
     * @param message descripción del problema detectado
     */
    public BusinessException(String message) {
        super(message);
    }
}
