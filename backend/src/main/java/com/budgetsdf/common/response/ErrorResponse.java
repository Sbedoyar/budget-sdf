package com.budgetsdf.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Estructura común de las respuestas de error, con estado HTTP y mensaje descriptivo.
 */
@Getter
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String message;
}
