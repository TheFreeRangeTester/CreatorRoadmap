# Guía Completa de Testing para Stripe - Fanlist

Esta guía te explica cómo probar todos los flujos de pago de Stripe sin realizar cobros reales durante el desarrollo.

## 🎯 Opciones de Testing Disponibles

### 1. Panel de Testing Integrado (Recomendado)

**Ubicación**: Visible en `/subscription` solo en modo desarrollo

**Características**:
- Simula pagos exitosos, cancelados y fallidos
- Simula cancelación de suscripciones
- Activa automáticamente características premium
- Incluye animaciones de confetti para pagos exitosos
- Muestra tarjetas de prueba de Stripe

**Cómo usar**:
1. Ve a la página de suscripciones (`/subscription`)
2. Encuentra el "Panel de Testing de Stripe" (solo visible en desarrollo)
3. Selecciona el plan (mensual o anual)
4. Haz clic en el escenario que quieres probar

### 2. Tarjetas de Prueba de Stripe

**Tarjetas disponibles**:
- `4242424242424242` - Visa - Siempre funciona
- `4000000000000002` - Visa - Siempre rechazada
- `4000000000009995` - Visa - Fondos insuficientes
- `4000000000000069` - Visa - Tarjeta vencida
- `4000000000000119` - Visa - Error de procesamiento

**Datos adicionales**:
- Fecha de vencimiento: Cualquier fecha futura (ej: 12/34)
- CVC: Cualquier número de 3 dígitos (ej: 123)

### 3. URLs de Testing Directo

**Páginas de resultado**:
- `/payment/success?test=true` - Página de pago exitoso
- `/payment/cancel?test=true` - Página de pago cancelado
- `/payment/failure?test=true` - Página de pago fallido

## 🧪 Escenarios de Testing

### Flujo de Pago Exitoso

**Lo que sucede**:
1. ✅ Estado de suscripción cambia a "premium"
2. ✅ Se activan todas las características premium
3. ✅ Animación de confetti celebratoria
4. ✅ Redirección a página de éxito
5. ✅ Actualización automática del dashboard

**Cómo probarlo**:
- **Panel de Testing**: Botón "Pago Exitoso"
- **API**: `POST /api/stripe/test/simulate-payment` con `{ "plan": "monthly", "scenario": "success" }`
- **URL Directa**: Visitar `/payment/success?test=true`

### Flujo de Cancelación de Pago

**Lo que sucede**:
1. ❌ No se modifica el estado de suscripción
2. ❌ No se activan características premium
3. ℹ️ Mensaje informativo de cancelación
4. ↩️ Opción para reintentar o volver al dashboard

**Cómo probarlo**:
- **Panel de Testing**: Botón "Pago Cancelado"
- **API**: `POST /api/stripe/test/simulate-payment` con `{ "plan": "monthly", "scenario": "cancel" }`
- **URL Directa**: Visitar `/payment/cancel?test=true`

### Flujo de Pago Fallido

**Lo que sucede**:
1. ❌ Error en el procesamiento del pago
2. ❌ No se modifica el estado de suscripción
3. ⚠️ Mensaje de error con posibles causas
4. 💡 Recomendaciones para resolver el problema
5. ↩️ Opciones para reintentar

**Cómo probarlo**:
- **Panel de Testing**: Botón "Pago Fallido"
- **API**: `POST /api/stripe/test/simulate-payment` con `{ "plan": "monthly", "scenario": "fail" }`
- **URL Directa**: Visitar `/payment/failure?test=true`

### Flujo de Cancelación de Suscripción

**Lo que sucede**:
1. ❌ Estado de suscripción cambia a "free"
2. ❌ Se desactivan características premium
3. ✅ Confirmación de cancelación exitosa
4. ℹ️ El usuario mantiene acceso hasta el final del período de facturación

**Cómo probarlo**:
- **Panel de Testing**: Botón "Simular Cancelación de Suscripción"
- **API**: `POST /api/stripe/test/simulate-cancellation`

## 🔧 APIs de Testing Disponibles

### Simular Pago
```http
POST /api/stripe/test/simulate-payment
Content-Type: application/json

{
  "plan": "monthly" | "yearly",
  "scenario": "success" | "cancel" | "fail"
}
```

### Simular Cancelación
```http
POST /api/stripe/test/simulate-cancellation
Content-Type: application/json
```

### Simular Webhook
```http
POST /api/stripe/test/webhook
Content-Type: application/json

{
  "eventType": "customer.subscription.created" | "customer.subscription.updated" | "customer.subscription.deleted" | "invoice.payment_failed",
  "userId": 123,
  "plan": "monthly" | "yearly"
}
```

### Obtener Tarjetas de Prueba
```http
GET /api/stripe/test/cards
```

## 💳 Características Premium Desbloqueadas

Cuando un pago es exitoso, se activan automáticamente:

1. **Ideas Ilimitadas y Visibles**
   - Sin límite en el número de ideas
   - Ideas visibles públicamente

2. **Sin Marca de Agua**
   - Interfaz limpia sin branding de Fanlist

3. **Analíticas Avanzadas**
   - Estadísticas detalladas de engagement
   - Métricas de audiencia

4. **Soporte Prioritario**
   - Respuesta más rápida a consultas
   - Acceso a características beta

## 🎨 Elementos Visuales de Testing

### Animaciones
- **Confetti**: Se activa automáticamente en pagos exitosos
- **Transiciones**: Animaciones suaves entre estados
- **Loading States**: Indicadores de carga durante simulaciones

### Badges de Estado
- 🟢 **Premium**: Usuario con suscripción activa
- 🟡 **Trial**: Usuario en período de prueba
- ⚪ **Free**: Usuario sin suscripción

### Notificaciones
- **Toast Success**: Para operaciones exitosas
- **Toast Error**: Para errores y fallos
- **Toast Info**: Para cancelaciones y información general

## 🔒 Seguridad en Testing

- **Solo Desarrollo**: Las rutas de testing solo están disponibles cuando `NODE_ENV=development`
- **Sin Datos Reales**: Todas las simulaciones usan datos de prueba
- **Sin Cobros**: Ninguna simulación genera cobros reales
- **Aislado**: El testing no afecta datos de producción

## 📱 Testing en Diferentes Dispositivos

El sistema de testing funciona correctamente en:
- **Desktop**: Panel completo visible
- **Tablet**: Botones adaptados al tamaño
- **Mobile**: Interfaz optimizada para móvil

## 🚀 Flujo de Testing Recomendado

1. **Iniciar Sesión**: Autenticarse como usuario de prueba
2. **Ir a Suscripciones**: Navegar a `/subscription`
3. **Probar Pago Exitoso**: Verificar activación premium + confetti
4. **Probar Cancelación**: Verificar desactivación de características
5. **Probar Pago Fallido**: Verificar manejo de errores
6. **Probar Pago Cancelado**: Verificar que no hay cambios
7. **Verificar Dashboard**: Confirmar que los cambios se reflejan

## 🎯 Casos de Testing Específicos

### Verificar Redirecciones
- Pago exitoso → `/payment/success?test=true`
- Pago cancelado → `/payment/cancel?test=true`
- Pago fallido → `/payment/failure?test=true`

### Verificar Estados de UI
- Botones deshabilitados durante procesamiento
- Loading spinners activos
- Mensajes de error apropiados
- Actualización automática de datos del usuario

### Verificar Características Premium
- Creación de ideas ilimitadas
- Visibilidad pública de ideas
- Acceso a analíticas avanzadas
- Interfaz sin marca de agua

## 🛠️ Troubleshooting

### Problema: Panel de testing no visible
**Solución**: Verificar que `NODE_ENV=development`

### Problema: Confetti no aparece
**Solución**: Verificar que la librería `canvas-confetti` está instalada

### Problema: APIs de testing fallan
**Solución**: Verificar autenticación del usuario

### Problema: Estados no se actualizan
**Solución**: Verificar que React Query está invalidando las cachés correctamente

## 📞 Soporte

Si encuentras problemas con el sistema de testing:
1. Verifica que estás en modo desarrollo
2. Revisa la consola del navegador para errores
3. Verifica los logs del servidor
4. Confirma que el usuario está autenticado

Esta guía te permite probar completamente todos los flujos de pago sin riesgo de cobros reales durante el desarrollo.