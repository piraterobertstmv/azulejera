# 📥 Guía de Importación Masiva de Pedidos

## 🎯 Opción 1: Importar desde JSON (MÁS FÁCIL)

### Paso 1: Prepara tu archivo JSON

Crea un archivo JSON con tus pedidos siguiendo este formato:

```json
[
  {
    "numeroPedido": "PED-2025-0001",
    "fechaPedido": "2025-01-15",
    "cliente": "Juan Pérez",
    "estadoPedido": "Entregado",
    "formaPago": "Transferencia",
    "proveedor": "Azulejos del Norte",
    "material": "Azulejo porcelánico blanco",
    "formato": "60x60",
    "cajas": 10,
    "piezas": 40,
    "metrosCuadrados": 14.4,
    "pvpMaterial": 500.00,
    "costeMaterial": 350.00,
    "pvpTransporte": 50.00,
    "costeTransporte": 30.00,
    "factura": "FAC-2025-001"
  }
]
```

### Paso 2: Ejecuta la importación

```bash
cd /Users/antoniomoyavalls/Downloads/azulejera/gestion-pedidos-azulejos/app
npm run import ./data/mis-pedidos.json
```

---

## 📊 Opción 2: Convertir desde Excel/CSV

### Paso 1: Prepara tu archivo Excel/CSV con estas columnas:

| numeroPedido | fechaPedido | cliente | estadoPedido | formaPago | proveedor | material | formato | cajas | piezas | metrosCuadrados | pvpMaterial | costeMaterial | pvpTransporte | costeTransporte | factura |
|--------------|-------------|---------|--------------|-----------|-----------|----------|---------|-------|--------|-----------------|-------------|---------------|---------------|-----------------|---------|
| PED-2025-0001 | 2025-01-15 | Juan Pérez | Entregado | Transferencia | Azulejos del Norte | Azulejo blanco | 60x60 | 10 | 40 | 14.4 | 500.00 | 350.00 | 50.00 | 30.00 | FAC-001 |

### Paso 2: Convierte tu CSV a JSON

Usa herramientas online como:
- https://www.csvjson.com/csv2json
- https://csvjson.com/
- O usa Excel: Guarda como → CSV → Convierte a JSON

### Paso 3: Ejecuta la importación

```bash
npm run import ./data/mis-pedidos.json
```

---

## 🔧 Campos Disponibles

### Campos Obligatorios:
- `numeroPedido` - String (único)
- `fechaPedido` - String (formato: YYYY-MM-DD)
- `cliente` - String

### Campos Opcionales:
- `estadoPedido` - String (ejemplo: "Pendiente", "Entregado", "Facturado")
- `formaPago` - String (ejemplo: "Transferencia", "Efectivo", "Tarjeta")
- `proveedor` - String (se crea automáticamente si no existe)
- `material` - String
- `formato` - String (ejemplo: "60x60", "30x60") (se crea automáticamente si no existe)
- `cajas` - Number
- `piezas` - Number
- `metrosCuadrados` - Number
- `pvpMaterial` - Number (precio de venta material)
- `costeMaterial` - Number (coste material)
- `pvpTransporte` - Number (precio de venta transporte)
- `costeTransporte` - Number (coste transporte)
- `factura` - String
- `observaciones` - String

---

## 💡 Ejemplos Rápidos

### Ejemplo Mínimo (solo campos obligatorios):
```json
[
  {
    "numeroPedido": "PED-001",
    "fechaPedido": "2025-01-15",
    "cliente": "Juan Pérez"
  }
]
```

### Ejemplo Completo:
Ver archivo: `data/pedidos-example.json`

---

## 🚀 Proceso de Importación

El script automáticamente:
1. ✅ Crea proveedores si no existen
2. ✅ Crea formatos si no existen
3. ✅ Busca estados de pedido existentes
4. ✅ Busca formas de pago existentes
5. ✅ Calcula beneficios y porcentajes automáticamente
6. ✅ Muestra resumen de importación

---

## ⚠️ Notas Importantes

1. **Números de pedido únicos**: Cada `numeroPedido` debe ser único
2. **Formato de fecha**: Usa formato ISO: `YYYY-MM-DD`
3. **Números decimales**: Usa punto (.) como separador: `500.50`
4. **Estados y formas de pago**: Deben existir en la base de datos o usa los exactos:
   - Estados: "Pendiente", "En proceso", "Entregado", "Facturado", etc.
   - Formas de pago: "Transferencia", "Efectivo", "Tarjeta", "PayPal", etc.

---

## 🔍 Ver datos importados

Después de la importación, puedes verificar:
- En la aplicación: http://localhost:3004/pedidos
- Con Prisma Studio: `npx prisma studio`

---

## 📝 Plantilla Vacía

```json
[
  {
    "numeroPedido": "",
    "fechaPedido": "",
    "cliente": "",
    "estadoPedido": "",
    "formaPago": "",
    "proveedor": "",
    "material": "",
    "formato": "",
    "cajas": 0,
    "piezas": 0,
    "metrosCuadrados": 0,
    "pvpMaterial": 0,
    "costeMaterial": 0,
    "pvpTransporte": 0,
    "costeTransporte": 0,
    "factura": ""
  }
]
```

