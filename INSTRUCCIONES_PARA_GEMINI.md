# 📋 INSTRUCCIONES PARA GEMINI - Sistema UIDE-Link

## 🎯 RESUMEN DEL PROYECTO

Este es un sistema de telemetría de buses para la **Universidad Internacional del Ecuador (UIDE)** con las siguientes características clave:

### Innovación Principal: "Bus Camaleón" 🦎
- **Problema**: Un mismo bus físico sirve múltiples rutas a lo largo del día
- **Solución**: UN solo código QR estático por bus, el backend detecta automáticamente qué ruta está sirviendo según la hora del escaneo
- **Ejemplo**: BUS-05 con QR "UIDE-BUS-05"
  - 07:00-08:30 → Ruta ARMENIA
  - 11:00-12:30 → Ruta VALLE  
  - 16:00-17:30 → Ruta CENTRO

### Características Principales
✅ **Experiencia sin fricción**: < 3 segundos de interacción total
✅ **Sesiones persistentes**: Sin login repetido (30 días)
✅ **Gamificación completa**: Puntos, rachas, CO₂, logros
✅ **Offline-first**: Funciona sin internet, sincroniza después
✅ **Colores UIDE**: Tema vino (#7C1F3E) con dorado (#D4AF37)

---

## 📁 ESTRUCTURA DEL PROYECTO

```
proyecto de buses UIDE/
├── backend/
│   ├── services/
│   │   ├── __init__.py              ✨ Inicializa módulo de servicios
│   │   ├── route_resolver.py        🧠 Lógica del bus camaleón
│   │   └── gamification.py          🏆 Sistema de puntos/logros
│   ├── main.py                      🌐 API FastAPI
│   ├── models.py                    📊 Modelos de base de datos
│   ├── db.py                        🔌 Conexión a PostgreSQL
│   ├── test_resolver.py             🧪 Script de prueba
│   └── requirements.txt             📦 Dependencias Python
│
├── database/
│   ├── schema.sql                   🗄️ Esquema de base de datos V2
│   └── seed.sql                     🌱 Datos de prueba
│
├── frontend/public/
│   ├── student.html                 📱 Interfaz principal
│   ├── driver.html                  🚌 Interfaz para conductores
│   ├── css/
│   │   ├── styles.css               🎨 Estilos base
│   │   └── scanner-ui.css           ✨ Tema UIDE elegante
│   ├── js/
│   │   ├── scanner.js               📷 Escáner QR
│   │   ├── gamification.js          🎮 Animaciones de puntos
│   │   ├── db.js                    💾 IndexedDB offline
│   │   └── sync.js                  🔄 Sincronización
│   └── sw.js                        ⚙️ Service Worker PWA
│
├── README.md                        📖 Documentación principal
└── QUICKSTART.md                    🚀 Guía rápida
```

---

## 🔑 CREDENCIALES Y CONFIGURACIÓN

### Base de Datos PostgreSQL

**Archivo**: `backend/db.py` (línea 3)

```python
DATABASE_URL = "postgresql://uide:Contra.123.contra@localhost:5432/uide_link"
```

**Desglose**:
- **Usuario**: `uide`
- **Contraseña**: `Contra.123.contra`
- **Host**: `localhost`
- **Puerto**: `5432` (por defecto PostgreSQL)
- **Base de datos**: `uide_link`

### API Backend

**Puerto**: `8000`
**URL**: `http://localhost:8000`

### Frontend

**Puerto**: `3000`
**URL**: `http://localhost:3000/student.html`

---

## 🛠️ INSTALACIÓN PASO A PASO

### 1. Prerequisitos

Asegúrate de que el usuario tenga instalado:

- ✅ **PostgreSQL** (versión 12 o superior)
  - Windows: https://www.postgresql.org/download/windows/
  - Mac: `brew install postgresql`
  - Linux: `sudo apt-get install postgresql`

- ✅ **Python 3.8+**
  - Verifica: `python --version`

- ✅ **pip** (gestor de paquetes Python)
  - Verifica: `pip --version`

### 2. Configurar Base de Datos

```bash
# Paso 1: Crear usuario y base de datos en PostgreSQL
psql -U postgres

# Dentro de psql:
CREATE USER uide WITH PASSWORD 'Contra.123.contra';
CREATE DATABASE uide_link OWNER uide;
GRANT ALL PRIVILEGES ON DATABASE uide_link TO uide;
\q

# Paso 2: Aplicar el esquema
cd "c:\Users\mvill\Desktop\proyecto de buses UIDE"
psql -U uide -d uide_link -f database/schema.sql

# Paso 3: Cargar datos de prueba
psql -U uide -d uide_link -f database/seed.sql

# Paso 4: Verificar
psql -U uide -d uide_link -c "SELECT bus_number, static_qr_id FROM buses;"
```

**Salida esperada**:
```
 bus_number | static_qr_id  
------------+---------------
 BUS-01     | UIDE-BUS-01
 BUS-02     | UIDE-BUS-02
 BUS-03     | UIDE-BUS-03
 BUS-04     | UIDE-BUS-04
 BUS-05     | UIDE-BUS-05
```

### 3. Configurar Backend

```bash
# Navegar al backend
cd backend

# Crear entorno virtual (recomendado)
python -m venv env

# Activar entorno virtual
# Windows:
.\env\Scripts\activate
# Mac/Linux:
source env/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Verificar que se instalaron
pip list | findstr fastapi
pip list | findstr sqlmodel
pip list | findstr uvicorn
```

### 4. Iniciar Backend

```bash
# Desde el directorio backend/
python -m uvic

orn main:app --reload --port 8000
```

**Salida esperada**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Verificar**: Abre http://localhost:8000 en el navegador
- Debería mostrar un JSON con información de la API

### 5. Probar Backend (Opcional pero Recomendado)

```bash
# En OTRA terminal (mantén el backend corriendo)
cd backend
python test_resolver.py
```

**Salida esperada**:
```
📅 SCHEDULE FOR BUS-05:
🚏 ARMENIA - La Armenia
   Time: 07:00 - 08:30
   Days: Mon, Tue, Wed, Thu, Fri
   Priority: 10

⏰ Scan at 07:30:
   ✓ Route: ARMENIA - La Armenia
   ✓ Distance: 8.5 km
   💰 Points: 85
   🌱 CO2 Saved: 425g

⏰ Scan at 11:30:
   ✓ Route: VALLE - Valle de los Chillos
   💰 Points: 123
   🌱 CO2 Saved: 615g
```

✅ Si ves esto, el sistema de bus camaleón funciona correctamente!

### 6. Iniciar Frontend

```bash
# En OTRA terminal (mantén el backend corriendo)
cd frontend/public
python -m http.server 3000
```

**Salida esperada**:
```
Serving HTTP on :: port 3000 (http://[::]:3000/) ...
```

**Abrir**: http://localhost:3000/student.html

---

## 🧪 CÓMO PROBAR EL SISTEMA

### Opción 1: Generar Códigos QR

**Herramientas online**:
- https://qr.io
- https://www.qr-code-generator.com/

**Códigos QR para generar**:
```
UIDE-BUS-01  → Bus normal (ruta fija)
UIDE-BUS-05  → Bus camaleón (3 rutas según hora)
```

**Los códigos QR ya generados están en**:
`C:\Users\mvill\.gemini\antigravity\brain\5768dc98-ad6c-415d-8e6a-676bfd00d18b\`
- `qr_bus_01_*.png`
- `qr_bus_05_*.png`
- `qr_all_buses_*.png`

### Opción 2: Probar con cURL (Sin Frontend)

```bash
# Test 1: Escanear BUS-05 en la mañana
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d "{\"static_qr_id\": \"UIDE-BUS-05\", \"scan_type\": \"ENTRY\", \"client_event_id\": \"test-1\", \"client_timestamp\": \"2025-12-17T07:30:00\"}"

# Test 2: Escanear BUS-05 al mediodía
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d "{\"static_qr_id\": \"UIDE-BUS-05\", \"scan_type\": \"ENTRY\", \"client_event_id\": \"test-2\", \"client_timestamp\": \"2025-12-17T11:30:00\"}"
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Welcome! Route detected: La Armenia",
  "route_name": "La Armenia",
  "bus_number": "BUS-05",
  "points_earned": 85,
  "co2_saved": "425g",
  "total_points": 85,
  "current_streak": 1,
  "session_token": "..."
}
```

### Opción 3: Probar desde el Teléfono

1. **Obtener IP de la computadora**:
   ```bash
   # Windows
   ipconfig
   # Buscar "Dirección IPv4" (ej: 192.168.1.100)
   ```

2. **Conectar el teléfono a la misma WiFi**

3. **Abrir en el teléfono**:
   ```
   http://192.168.1.100:3000/student.html
   ```

4. **Escanear QR codes** y experimentar:
   - Vibración instantánea
   - Animación con colores UIDE
   - Puntos ganados
   - CO₂ ahorrado

---

## 🎨 CARACTERÍSTICAS DEL DISEÑO

### Paleta de Colores UIDE

**Archivo**: `frontend/public/css/scanner-ui.css`

```css
--uide-wine-primary: #7C1F3E;   /* Vino principal UIDE */
--uide-wine-dark: #5A1629;      /* Vino oscuro */
--uide-wine-light: #9F2B4F;     /* Vino claro */
--uide-gold: #D4AF37;           /* Dorado elegante */
--uide-cream: #F5EFE7;          /* Crema suave */
```

### Efectos Visuales
- 🔮 **Glassmorphism**: Tarjetas con vidrio esmerilado
- ✨ **Animaciones**: Pulsos, brillos, rotaciones
- 💎 **Neon**: Bordes dorados brillantes
- 🌙 **Tema oscuro**: Optimizado para exteriores

---

## 🔄 FLUJO DE TRABAJO COMPLETO

### 1. Estudiante Escanea QR

```
Estudiante abre app → Toca "Escanear QR" → Apunta cámara
↓
QR detectado: "UIDE-BUS-05"
↓
📳 Vibración instantánea [200ms, 100ms, 200ms]
↓
Frontend envía a backend:
{
  static_qr_id: "UIDE-BUS-05",
  scan_type: "ENTRY",
  client_timestamp: "2025-12-17T07:30:00",
  session_token: "abc123..."
}
```

### 2. Backend Resuelve Ruta

```python
# services/route_resolver.py

1. Buscar bus con static_qr_id = "UIDE-BUS-05" → bus_id = 5

2. Buscar en schedule_assignments WHERE:
   - bus_id = 5
   - day_of_week contiene "Tue" (martes)
   - 07:30 BETWEEN start_time AND end_time

3. Encuentra: route_id = 1 (ARMENIA)

4. Retorna: (bus_id=5, route_id=1)
```

### 3. Backend Calcula Gamificación

```python
# services/gamification.py

1. Obtener ruta: ARMENIA (distance_km = 8.5)

2. Calcular puntos:
   base_points = 8.5 × 10 = 85
   if has_streak: points = 85 × 1.2 = 102
   else: points = 85

3. Calcular CO₂:
   co2_grams = 8.5 × 50 = 425g

4. Actualizar racha del estudiante

5. Verificar logros desbloqueados
```

### 4. Frontend Muestra Feedback

```javascript
// js/gamification.js

1. Animación completa pantalla con:
   - "✓ La Armenia"
   - "+85 puntos"
   - "🌱 425g CO₂ ahorrado"

2. Actualizar header:
   - Total puntos: 85 → 170
   - Racha: 1🔥 → 2🔥
   - Total CO₂: 425g → 850g

3. Agregar a historial reciente
```

**Tiempo total: ~2.5 segundos** ⚡

---

## 🗄️ ESTRUCTURA DE LA BASE DE DATOS

### Tablas Principales

#### `buses`
- Almacena información de buses físicos
- Campo clave: `static_qr_id` (ej: "UIDE-BUS-05")

#### `routes`
- Rutas disponibles (ARMENIA, VALLE, CENTRO, CUMBAYA)
- Incluye `distance_km` para cálculo de puntos

#### `schedule_assignments` 🔥 **TABLA CENTRAL**
- **Poder del bus camaleón**
- Mapea: `bus_id` → `route_id` + `start_time` + `end_time` + `days_of_week`
- Ejemplo para BUS-05:
  ```sql
  bus_id | route_id | start_time | end_time | days_of_week
  -------|----------|------------|----------|-------------
  5      | 1        | 07:00      | 08:30    | {Mon,Tue,Wed,Thu,Fri}
  5      | 2        | 11:00      | 12:30    | {Mon,Tue,Wed,Thu,Fri}
  5      | 3        | 16:00      | 17:30    | {Mon,Tue,Wed,Thu,Fri}
  ```

#### `students`
- Perfiles de estudiantes
- Gamificación: `total_points`, `current_streak`, `total_co2_saved`
- `session_token` para sesiones persistentes

#### `scan_events`
- Registro de cada escaneo
- Campo clave: `inferred_route_id` (ruta detectada automáticamente)
- Incluye `points_awarded` y `co2_saved_grams`

#### `achievements`
- Logros disponibles:
  - 🎉 FIRST_RIDE (1 scan)
  - 🔥 WEEK_WARRIOR (7 días consecutivos)
  - 🌱 ECO_HERO (10kg CO₂)
  - 💯 CENTURY_CLUB (100 puntos)
  - 🗺️ ROUTE_EXPLORER (usar todas las rutas)

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Error 1: "ModuleNotFoundError: No module named 'services'"

**Causa**: Falta el archivo `__init__.py` en la carpeta services

**Solución**:
```bash
cd backend/services
# Ya está creado en services/__init__.py
```

### Error 2: "could not connect to server"

**Causa**: PostgreSQL no está corriendo

**Solución**:
```bash
# Windows: Iniciar servicio PostgreSQL
# Buscar "Services" → PostgreSQL → Iniciar

# Mac:
brew services start postgresql

# Linux:
sudo systemctl start postgresql
```

### Error 3: "relation 'buses' does not exist"

**Causa**: No se aplicó el schema

**Solución**:
```bash
psql -U uide -d uide_link -f database/schema.sql
psql -U uide -d uide_link -f database/seed.sql
```

### Error 4: "Camera permission denied" en frontend

**Causa**: Navegadores requieren HTTPS para cámara (excepto localhost)

**Solución**:
- Usa `localhost:3000` (no la IP) cuando pruebes en la misma máquina
- Para probar en teléfono: usa la IP local está bien

### Error 5: Backend se cierra solo

**Causa**: Error en el código Python no manejado

**Solución**:
```bash
# Ver el error completo en la terminal
# Buscar línea con "Error" o "Exception"
# Reportar el error específico para debugging
```

---

## 📊 ENDPOINTS DE LA API

### POST /api/scan
**Propósito**: Registrar escaneo de QR (endpoint principal)

**Request**:
```json
{
  "static_qr_id": "UIDE-BUS-05",
  "scan_type": "ENTRY",
  "client_event_id": "uuid-unique",
  "client_timestamp": "2025-12-17T07:30:00",
  "session_token": "optional-if-has-session"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Welcome! Route detected: La Armenia",
  "route_name": "La Armenia",
  "bus_number": "BUS-05",
  "points_earned": 85,
  "co2_saved": "425g",
  "total_points": 170,
  "current_streak": 2,
  "total_co2_display": "850g",
  "new_achievements": [],
  "session_token": "new-token"
}
```

### GET /api/student/summary
**Propósito**: Obtener resumen de gamificación

**Query**: `?session_token=abc123`

**Response**:
```json
{
  "total_points": 250,
  "current_streak": 5,
  "total_co2_saved": 1250,
  "total_co2_display": "1.25kg",
  "achievements": ["FIRST_RIDE", "WEEK_WARRIOR"]
}
```

### GET /api/leaderboard
**Propósito**: Top 10 estudiantes

**Response**:
```json
[
  {
    "student_id": 1,
    "first_name": "María",
    "total_points": 500,
    "current_streak": 10
  },
  ...
]
```

### GET /api/routes
**Propósito**: Listar todas las rutas

### GET /api/routes/{route_id}/stops
**Propósito**: Paradas de una ruta específica

### GET /api/bus/{static_qr_id}/schedule
**Propósito**: Ver horario de un bus (debugging)

---

## 🎮 FÓRMULAS DE GAMIFICACIÓN

### Puntos
```python
POINTS_PER_KM = 10
STREAK_BONUS_MULTIPLIER = 1.2  # 20% extra

# Sin racha:
points = distance_km × 10

# Con racha activa:
points = distance_km × 10 × 1.2
```

**Ejemplo**:
- ARMENIA (8.5 km): 85 puntos normales, 102 con racha
- VALLE (12.3 km): 123 puntos normales, 148 con racha

### CO₂ Ahorrado
```python
CO2_PER_KM = 50  # gramos

co2_grams = distance_km × 50
```

**Ejemplo**:
- ARMENIA (8.5 km): 425g CO₂
- VALLE (12.3 km): 615g CO₂

### Rachas
```python
# Lógica de racha:
if days_since_last_scan == 1:
    streak += 1  # Día consecutivo
elif days_since_last_scan > 1:
    streak = 1   # Reset
# Mismo día = no cambia
```

---

## 🔐 SEGURIDAD Y PRIVACIDAD

### Sesiones
- **Duración**: 30 días
- **Token**: SHA-256 hash
- **Almacenamiento**: IndexedDB en cliente

### Datos Anónimos
- Sistema permite uso sin registro
- ID anónimo auto-generado
- IP y user-agent hasheados

### Offline
- Datos guardados localmente en IndexedDB
- Sincronización automática cuando hay conexión
- `client_event_id` previene duplicados

---

## 📝 TAREAS COMPLETADAS

✅ Schema V2 con tabla `schedule_assignments`
✅ Servicio `RouteResolver` (bus camaleón)
✅ Servicio `GamificationService` (puntos/rachas)
✅ API endpoints actualizados
✅ Frontend con colores UIDE
✅ UI instant feedback (< 3s)
✅ Códigos QR generados
✅ Documentación completa
✅ Limpieza de archivos obsoletos
✅ Script de prueba (`test_resolver.py`)

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

### Para Producción
1. Cambiar credenciales de DB a variables de entorno
2. Configurar HTTPS para el frontend
3. Optimizar índices de base de datos
4. Configurar logging profesional
5. Setup de backups automáticos

### Mejoras Futuras
1. Dashboard de administración
2. Reportes analíticos
3. Notificaciones push
4. Integración con sistema académico UIDE
5. App móvil nativa (React Native/Flutter)

---

## 💡 CONSEJOS PARA DEBUGGING

### Ver logs del backend
```python
# En main.py o services, agregar:
print(f"[DEBUG] Variable: {value}")
```

### Ver logs del frontend
```javascript
// Abrir DevTools (F12) → Console
console.log('[DEBUG] Data:', data);
```

### Verificar base de datos
```bash
psql -U uide -d uide_link

# Ver todas las rutas:
SELECT * FROM routes;

# Ver schedule del BUS-05:
SELECT * FROM schedule_assignments WHERE bus_id = 5;

# Ver últimos escaneos:
SELECT * FROM scan_events ORDER BY scanned_at DESC LIMIT 10;
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de considerar el sistema "funcional", verificar:

- [ ] PostgreSQL corriendo
- [ ] Base de datos `uide_link` existe
- [ ] Usuario `uide` tiene permisos
- [ ] Schema aplicado (tabla `schedule_assignments` existe)
- [ ] Datos seed cargados (5 buses existen)
- [ ] Backend inicia sin errores
- [ ] Test script muestra rutas correctas
- [ ] Frontend carga en localhost:3000
- [ ] QR codes generados disponibles
- [ ] Escaneo funciona (prueba con cURL)
- [ ] Gamificación calcula puntos
- [ ] Colores UIDE visibles en UI

---

## 🎓 CONTEXTO UNIVERSITARIO

**Universidad**: Universidad Internacional del Ecuador (UIDE)
**Proyecto**: Sistema de telemetría para buses estudiantiles
**Objetivo**: Recolectar datos de uso de rutas de manera gamificada
**Usuarios**: Estudiantes universitarios
**Incentivo**: Puntos, rachas, impacto ambiental (CO₂ ahorrado)

---

## 📞 INFORMACIÓN DE CONTACTO

**Proyecto**: UIDE-Link
**Repositorio**: https://github.com/jokker5502/UIDEMATEOLINK.git
**Workspace**: `c:\Users\mvill\Desktop\proyecto de buses UIDE`

---

**¡Sistema UIDE-Link listo para usar!** 🎉

Si encuentras algún error, revisa esta guía paso a paso. La mayoría de problemas se resuelven verificando que PostgreSQL esté corriendo y que las credenciales sean correctas.
