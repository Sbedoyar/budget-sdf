const EXCEL_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const COLORS = {
  budget900: '064E3B',
  budget800: '065F46',
  budget700: '047857',
  budget600: '059669',
  budget100: 'D1FAE5',
  budget50: 'ECFDF5',
  slate900: '0F172A',
  slate700: '334155',
  slate500: '64748B',
  slate200: 'E2E8F0',
  white: 'FFFFFF',
  amber100: 'FEF3C7',
  amber700: 'B45309',
  red100: 'FEE2E2',
  red700: 'B91C1C',
}

const STOCK_STATUS_LABELS = {
  NORMAL: 'Normal',
  LOW_STOCK: 'Bajo stock',
  OUT_OF_STOCK: 'Sin stock',
}

const MOVEMENT_TYPE_LABELS = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
}

const formatDateForName = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}_${hours}${minutes}`
}

const formatFilterDate = (date) => {
  if (!date) {
    return 'Sin límite'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(new Date(`${date}T00:00:00`))
}

const getSelectedInventoryProducts = (inventoryReport, filters, mode) => {
  const products = inventoryReport?.products || []

  if (
    mode !== 'filtered' ||
    !Array.isArray(filters?.productIds) ||
    filters.productIds.length === 0
  ) {
    return products
  }

  const selectedIds = new Set(
    filters.productIds.map((productId) => String(productId)),
  )

  return products.filter((product) =>
    selectedIds.has(String(product.productId)),
  )
}

const getSelectedProductLabel = (inventoryReport, filters, mode) => {
  if (
    mode !== 'filtered' ||
    !Array.isArray(filters?.productIds) ||
    filters.productIds.length === 0
  ) {
    return 'Todos los productos'
  }

  const selectedProducts = getSelectedInventoryProducts(
    inventoryReport,
    filters,
    mode,
  )

  if (selectedProducts.length === 0) {
    return `${filters.productIds.length} productos seleccionados`
  }

  return selectedProducts
    .map((product) => `${product.code} · ${product.name}`)
    .join(', ')
}

const applyTitleStyle = (cell) => {
  cell.font = {
    name: 'Aptos Display',
    size: 18,
    bold: true,
    color: { argb: COLORS.white },
  }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.budget900 },
  }
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
  }
}

const applySectionStyle = (cell) => {
  cell.font = {
    name: 'Aptos',
    size: 12,
    bold: true,
    color: { argb: COLORS.budget900 },
  }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.budget100 },
  }
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
  }
}

const applyHeaderStyle = (row) => {
  row.height = 22

  row.eachCell((cell) => {
    cell.font = {
      name: 'Aptos',
      size: 10,
      bold: true,
      color: { argb: COLORS.white },
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.budget700 },
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
    }
    cell.border = {
      bottom: {
        style: 'thin',
        color: { argb: COLORS.budget900 },
      },
    }
  })
}

const applyBodyBorders = (worksheet, startRow, endRow, columnCount) => {
  if (endRow < startRow) {
    return
  }

  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    const row = worksheet.getRow(rowIndex)

    for (let columnIndex = 1; columnIndex <= columnCount; columnIndex += 1) {
      const cell = row.getCell(columnIndex)

      cell.font = {
        name: 'Aptos',
        size: 10,
        color: { argb: COLORS.slate700 },
      }
      cell.alignment = {
        vertical: 'middle',
      }
      cell.border = {
        bottom: {
          style: 'hair',
          color: { argb: COLORS.slate200 },
        },
      }
    }
  }
}

const styleStatusCell = (cell, status) => {
  if (status === 'NORMAL') {
    cell.font = { bold: true, color: { argb: COLORS.budget700 } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.budget50 },
    }
    return
  }

  if (status === 'LOW_STOCK') {
    cell.font = { bold: true, color: { argb: COLORS.amber700 } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.amber100 },
    }
    return
  }

  if (status === 'OUT_OF_STOCK') {
    cell.font = { bold: true, color: { argb: COLORS.red700 } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.red100 },
    }
  }
}

const styleMovementTypeCell = (cell, type) => {
  if (type === 'ENTRADA') {
    cell.font = { bold: true, color: { argb: COLORS.budget700 } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.budget50 },
    }
  } else {
    cell.font = { bold: true, color: { argb: COLORS.red700 } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.red100 },
    }
  }
}

const addTitle = (worksheet, title, subtitle, endColumn) => {
  worksheet.mergeCells(1, 1, 1, endColumn)
  const titleCell = worksheet.getCell(1, 1)
  titleCell.value = title
  applyTitleStyle(titleCell)
  worksheet.getRow(1).height = 30

  worksheet.mergeCells(2, 1, 2, endColumn)
  const subtitleCell = worksheet.getCell(2, 1)
  subtitleCell.value = subtitle
  subtitleCell.font = {
    name: 'Aptos',
    size: 10,
    italic: true,
    color: { argb: COLORS.slate500 },
  }
  subtitleCell.alignment = {
    vertical: 'middle',
    wrapText: true,
  }
  worksheet.getRow(2).height = 28
}

const addSummarySheet = ({
  workbook,
  inventoryReport,
  movementReport,
  filters,
  mode,
  generatedAt,
}) => {
  const worksheet = workbook.addWorksheet('Resumen', {
    views: [{ state: 'frozen', ySplit: 2 }],
  })

  worksheet.properties.defaultRowHeight = 19
  worksheet.columns = [
    { width: 27 },
    { width: 23 },
    { width: 23 },
    { width: 23 },
    { width: 23 },
    { width: 23 },
    { width: 23 },
  ]

  addTitle(
    worksheet,
    'Budget SDF · Reporte general',
    'Resumen ejecutivo de inventario actual y movimientos registrados.',
    7,
  )

  worksheet.mergeCells('A4:G4')
  worksheet.getCell('A4').value = 'Información de la exportación'
  applySectionStyle(worksheet.getCell('A4'))

  const metadata = [
    ['Tipo de exportación', mode === 'filtered' ? 'Vista filtrada' : 'Reporte completo'],
    [
      'Generado',
      generatedAt.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    ],
    ['Desde', mode === 'filtered' ? formatFilterDate(filters?.from) : 'Sin límite'],
    ['Hasta', mode === 'filtered' ? formatFilterDate(filters?.to) : 'Sin límite'],
    [
      'Tipo de movimiento',
      mode === 'filtered' && filters?.type
        ? MOVEMENT_TYPE_LABELS[filters.type] || filters.type
        : 'Todos los tipos',
    ],
    [
      'Productos',
      getSelectedProductLabel(inventoryReport, filters, mode),
    ],
  ]

  metadata.forEach(([label, value], index) => {
    const row = 5 + index
    worksheet.getCell(row, 1).value = label
    worksheet.getCell(row, 1).font = {
      bold: true,
      color: { argb: COLORS.slate700 },
    }
    worksheet.mergeCells(row, 2, row, 7)
    worksheet.getCell(row, 2).value = value
    worksheet.getCell(row, 2).font = {
      color: { argb: COLORS.slate700 },
    }
    worksheet.getCell(row, 2).alignment = { wrapText: true }
  })

  worksheet.mergeCells('A12:G12')
  worksheet.getCell('A12').value =
    'Nota: los filtros de fecha y tipo se aplican a los movimientos. El inventario representa el estado actual. Si se seleccionaron productos, la hoja Inventario se limita a esos productos.'
  worksheet.getCell('A12').font = {
    italic: true,
    color: { argb: COLORS.slate500 },
  }
  worksheet.getCell('A12').alignment = { wrapText: true }
  worksheet.getRow(12).height = 34

  worksheet.mergeCells('A14:C14')
  worksheet.getCell('A14').value = 'Inventario actual'
  applySectionStyle(worksheet.getCell('A14'))

  worksheet.mergeCells('E14:G14')
  worksheet.getCell('E14').value = 'Movimientos'
  applySectionStyle(worksheet.getCell('E14'))

  const inventorySummaryRows = [
    ['Total productos', inventoryReport.summary.totalProducts],
    ['Unidades en stock', inventoryReport.summary.totalUnitsInStock],
    ['Stock normal', inventoryReport.summary.productsWithNormalStock],
    ['Stock bajo', inventoryReport.summary.productsWithLowStock],
    ['Sin stock', inventoryReport.summary.productsOutOfStock],
  ]

  inventorySummaryRows.forEach(([label, value], index) => {
    const row = 15 + index
    worksheet.getCell(row, 1).value = label
    worksheet.getCell(row, 1).font = { color: { argb: COLORS.slate500 } }
    worksheet.getCell(row, 2).value = value
    worksheet.getCell(row, 2).font = {
      bold: true,
      color: { argb: COLORS.slate900 },
    }
  })

  const movementSummaryRows = [
    ['Movimientos', movementReport.summary.totalMovements],
    ['Entradas', movementReport.summary.totalInbound],
    ['Salidas', movementReport.summary.totalOutbound],
    ['Unidades entrada', movementReport.summary.inboundUnits],
    ['Unidades salida', movementReport.summary.outboundUnits],
    ['Balance de unidades', movementReport.summary.unitBalance],
  ]

  movementSummaryRows.forEach(([label, value], index) => {
    const row = 15 + index
    worksheet.getCell(row, 5).value = label
    worksheet.getCell(row, 5).font = { color: { argb: COLORS.slate500 } }
    worksheet.getCell(row, 6).value = value
    worksheet.getCell(row, 6).font = {
      bold: true,
      color: {
        argb:
          label === 'Balance de unidades' && value < 0
            ? COLORS.red700
            : COLORS.slate900,
      },
    }
  })

  const productTableStart = 23

  worksheet.mergeCells(productTableStart, 1, productTableStart, 7)
  worksheet.getCell(productTableStart, 1).value = 'Resumen de movimientos por producto'
  applySectionStyle(worksheet.getCell(productTableStart, 1))

  const headerRow = worksheet.getRow(productTableStart + 1)
  headerRow.values = [
    'Código',
    'Producto',
    'Movimientos',
    'Entradas',
    'Salidas',
    'Unidades entrada',
    'Balance',
  ]
  applyHeaderStyle(headerRow)

  const sortedProducts = [...(movementReport.byProduct || [])].sort((a, b) =>
    String(a.name).localeCompare(String(b.name), 'es'),
  )

  sortedProducts.forEach((product) => {
    worksheet.addRow([
      product.code,
      product.name,
      product.totalMovements,
      product.totalInbound,
      product.totalOutbound,
      product.inboundUnits,
      product.unitBalance,
    ])
  })

  if (sortedProducts.length === 0) {
    worksheet.addRow([
      '',
      'No hay movimientos para los filtros seleccionados.',
      '',
      '',
      '',
      '',
      '',
    ])
  }

  const productDataStart = productTableStart + 2
  const productDataEnd = productTableStart + 1 + Math.max(sortedProducts.length, 1)
  applyBodyBorders(worksheet, productDataStart, productDataEnd, 7)

  worksheet.autoFilter = {
    from: { row: productTableStart + 1, column: 1 },
    to: { row: productDataEnd, column: 7 },
  }

  return worksheet
}

const addInventorySheet = ({
  workbook,
  inventoryReport,
  filters,
  mode,
}) => {
  const worksheet = workbook.addWorksheet('Inventario', {
    views: [{ state: 'frozen', ySplit: 4 }],
  })

  worksheet.properties.defaultRowHeight = 19
  worksheet.columns = [
    { width: 15 },
    { width: 34 },
    { width: 24 },
    { width: 18 },
    { width: 15 },
    { width: 15 },
    { width: 18 },
  ]

  addTitle(
    worksheet,
    'Budget SDF · Inventario actual',
    'Existencias actuales al momento de generar el archivo. Las fechas del reporte no reconstruyen inventario histórico.',
    7,
  )

  const products = getSelectedInventoryProducts(
    inventoryReport,
    filters,
    mode,
  )

  worksheet.mergeCells('A3:G3')
  worksheet.getCell('A3').value =
    mode === 'filtered' && filters?.productIds?.length
      ? `Inventario actual de ${products.length} productos seleccionados`
      : `Inventario actual de ${products.length} productos`
  worksheet.getCell('A3').font = {
    italic: true,
    color: { argb: COLORS.slate500 },
  }

  const headerRow = worksheet.getRow(4)
  headerRow.values = [
    'Código',
    'Producto',
    'Categoría',
    'Unidad',
    'Stock actual',
    'Stock mínimo',
    'Estado',
  ]
  applyHeaderStyle(headerRow)

  products.forEach((product) => {
    const row = worksheet.addRow([
      product.code,
      product.name,
      product.category,
      product.unitOfMeasure,
      product.currentStock,
      product.minimumStock,
      STOCK_STATUS_LABELS[product.stockStatus] || product.stockStatus,
    ])

    styleStatusCell(row.getCell(7), product.stockStatus)
  })

  if (products.length === 0) {
    worksheet.addRow(['', 'No hay productos para exportar.', '', '', '', '', ''])
  }

  const endRow = 4 + Math.max(products.length, 1)
  applyBodyBorders(worksheet, 5, endRow, 7)

  worksheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: endRow, column: 7 },
  }

  return worksheet
}

const addMovementsSheet = ({ workbook, movementReport }) => {
  const worksheet = workbook.addWorksheet('Movimientos', {
    views: [{ state: 'frozen', ySplit: 4 }],
  })

  worksheet.properties.defaultRowHeight = 19
  worksheet.columns = [
    { width: 21 },
    { width: 15 },
    { width: 34 },
    { width: 14 },
    { width: 12 },
    { width: 18 },
    { width: 45 },
  ]

  addTitle(
    worksheet,
    'Budget SDF · Movimientos',
    'Historial de entradas y salidas incluido en esta exportación.',
    7,
  )

  worksheet.mergeCells('A3:G3')
  worksheet.getCell('A3').value = `${movementReport.movements.length} movimientos exportados`
  worksheet.getCell('A3').font = {
    italic: true,
    color: { argb: COLORS.slate500 },
  }

  const headerRow = worksheet.getRow(4)
  headerRow.values = [
    'Fecha',
    'Código',
    'Producto',
    'Tipo',
    'Cantidad',
    'Stock resultante',
    'Observación',
  ]
  applyHeaderStyle(headerRow)

  movementReport.movements.forEach((movement) => {
    const movementDate = new Date(movement.date)

    const row = worksheet.addRow([
      Number.isNaN(movementDate.getTime()) ? movement.date : movementDate,
      movement.productCode,
      movement.productName,
      MOVEMENT_TYPE_LABELS[movement.type] || movement.type,
      movement.quantity,
      movement.resultingStock,
      movement.observation || 'Sin observación',
    ])

    if (!Number.isNaN(movementDate.getTime())) {
      row.getCell(1).numFmt = 'dd/mm/yyyy hh:mm'
    }

    styleMovementTypeCell(row.getCell(4), movement.type)
    row.getCell(7).alignment = {
      vertical: 'middle',
      wrapText: true,
    }
  })

  if (movementReport.movements.length === 0) {
    worksheet.addRow([
      '',
      '',
      'No se encontraron movimientos para los filtros seleccionados.',
      '',
      '',
      '',
      '',
    ])
  }

  const endRow = 4 + Math.max(movementReport.movements.length, 1)
  applyBodyBorders(worksheet, 5, endRow, 7)

  worksheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: endRow, column: 7 },
  }

  return worksheet
}

const downloadWorkbook = async (workbook, filename) => {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: EXCEL_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * Genera y descarga un archivo Excel de reportes de Budget SDF.
 *
 * @param {Object} options datos necesarios para construir el libro
 * @param {Object} options.inventoryReport reporte actual de inventario
 * @param {Object} options.movementReport reporte de movimientos a exportar
 * @param {Object} options.filters filtros aplicados a la vista
 * @param {'filtered'|'full'} options.mode modalidad de exportación
 * @returns {Promise<void>}
 */
const exportReportsToExcel = async ({
  inventoryReport,
  movementReport,
  filters = {},
  mode = 'filtered',
}) => {
  if (!inventoryReport || !movementReport) {
    throw new Error('No hay información disponible para exportar')
  }

  /*
   * Se importa bajo demanda para que ExcelJS no aumente el paquete principal
   * de la aplicación cuando el usuario no utiliza la exportación.
   */
  const excelJsModule = await import('exceljs')
  const ExcelJS = excelJsModule.default || excelJsModule
  const workbook = new ExcelJS.Workbook()
  const generatedAt = new Date()

  workbook.creator = 'Budget SDF'
  workbook.company = 'Budget SDF'
  workbook.subject = 'Reporte de inventario y movimientos'
  workbook.title =
    mode === 'filtered'
      ? 'Budget SDF - Vista filtrada'
      : 'Budget SDF - Reporte completo'
  workbook.created = generatedAt
  workbook.modified = generatedAt

  addSummarySheet({
    workbook,
    inventoryReport,
    movementReport,
    filters,
    mode,
    generatedAt,
  })

  addInventorySheet({
    workbook,
    inventoryReport,
    filters,
    mode,
  })

  addMovementsSheet({
    workbook,
    movementReport,
  })

  const filename = `Budget_SDF_${
    mode === 'filtered' ? 'Vista_Filtrada' : 'Reporte_Completo'
  }_${formatDateForName(generatedAt)}.xlsx`

  await downloadWorkbook(workbook, filename)
}

export { exportReportsToExcel }
