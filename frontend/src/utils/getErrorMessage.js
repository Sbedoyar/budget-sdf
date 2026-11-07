export function getErrorMessage(error, fallbackMessage) {
  const message = error?.response?.data?.message

  if (typeof message === 'string' && message.trim()) {
    return message
  }

  if (!error?.response && error?.code === 'ERR_NETWORK') {
    return 'No fue posible conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.'
  }

  return fallbackMessage
}
