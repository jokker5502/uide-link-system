# 🚌 Códigos QR de Prueba - UIDE-Link

## 📱 Códigos QR Listos para Escanear

Aquí están los códigos QR que puedes usar para probar el sistema UIDE-Link.

---

## Bus Individual - BUS-01

![QR Code BUS-01](C:/Users/mvill/.gemini/antigravity/brain/5768dc98-ad6c-415d-8e6a-676bfd00d18b/qr_bus_01_1765926353720.png)

**Código**: `UIDE-BUS-01`  
**Ruta**: Armenia (fija)  
**Horario**: 06:00 - 09:00 y 15:00 - 19:00

---

## Bus Camaleón - BUS-05 ⭐

![QR Code BUS-05](C:/Users/mvill/.gemini/antigravity/brain/5768dc98-ad6c-415d-8e6a-676bfd00d18b/qr_bus_05_1765926365398.png)

**Código**: `UIDE-BUS-05`  
**Especial**: Este bus sirve múltiples rutas según la hora

**Horarios Automáticos**:
- 🅰️ **07:00 - 08:30** → Ruta ARMENIA (8.5 km, 85 pts)
- 🆅 **11:00 - 12:30** → Ruta VALLE (12.3 km, 123 pts)
- Ⓒ **16:00 - 17:30** → Ruta CENTRO (6.2 km, 62 pts)

---

## Todos los Buses - Hoja de Impresión

![QR Codes Todos](C:/Users/mvill/.gemini/antigravity/brain/5768dc98-ad6c-415d-8e6a-676bfd00d18b/qr_all_buses_1765926382161.png)

**Incluye**:
- BUS-01: Armenia
- BUS-02: Valle
- BUS-03: Centro
- BUS-04: Cumbayá
- BUS-05: Camaleón (múltiples rutas)

---

## 🧪 Cómo Probar

### Opción 1: Desde tu teléfono
1. Abre esta página en tu computadora
2. Accede desde tu teléfono a: `http://[IP-DE-TU-PC]:3000/student.html`
3. Escanea los códigos QR directamente desde la pantalla

### Opción 2: Imprime los códigos
1. Clic derecho en cualquier imagen
2. "Guardar imagen como..."
3. Imprime en papel
4. Escanea desde tu teléfono

### Opción 3: Pantalla completa
1. Clic en cualquier QR para verlo en grande
2. Pon el QR en pantalla completa
3. Escanea con otro dispositivo

---

## 📊 Qué Esperar al Escanear

Cuando escanees cualquiera de estos códigos QR:

1. **Vibración instantánea** del teléfono (patrón: corto-largo-corto)
2. **Animación de celebración** con los colores vino UIDE
3. **Información del viaje**:
   - Nombre de la ruta detectada
   - Puntos ganados
   - CO₂ ahorrado
4. **Actualización del header**:
   - Total de puntos
   - Racha de días consecutivos 🔥
   - Total de CO₂ ahorrado

---

## 🔥 Probar el Bus Camaleón (BUS-05)

Para ver la magia del sistema de resolución automática:

### Prueba en la Mañana (07:00 - 08:30)
```bash
# Si estás probando con curl:
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "static_qr_id": "UIDE-BUS-05",
    "scan_type": "ENTRY",
    "client_event_id": "test-123",
    "client_timestamp": "2025-12-16T07:30:00"
  }'
```
**Resultado esperado**: Ruta ARMENIA

### Prueba al Mediodía (11:00 - 12:30)
```bash
# Cambiar el timestamp a 11:30
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "static_qr_id": "UIDE-BUS-05",
    "scan_type": "ENTRY",
    "client_event_id": "test-456",
    "client_timestamp": "2025-12-16T11:30:00"
  }'
```
**Resultado esperado**: Ruta VALLE

---

## 💡 Tips para Mejores Escaneos

1. **Iluminación**: Asegúrate de tener buena luz
2. **Estabilidad**: Mantén el teléfono firme por 1-2 segundos
3. **Distancia**: Ni muy cerca ni muy lejos (15-20 cm)
4. **Enfoque**: Espera a que la cámara enfoque bien
5. **Pantalla limpia**: Limpia la pantalla si escaneas desde otra pantalla

---

## 🎨 Colores UIDE en Acción

Cuando escanees, verás los colores institucionales:

- **Vino Principal**: `#7C1F3E` - Color predominante
- **Dorado Elegante**: `#D4AF37` - Acentos y puntos
- **Crema**: `#F5EFE7` - Textos

---

## 📍 Ubicación de Archivos

Los códigos QR están guardados en:
```
C:\Users\mvill\.gemini\antigravity\brain\5768dc98-ad6c-415d-8e6a-676bfd00d18b\
├── qr_bus_01_*.png      (Bus 01)
├── qr_bus_05_*.png      (Bus 05 - Camaleón)
└── qr_all_buses_*.png   (Todos los buses)
```

---

## 🚀 Próximos Pasos

1. **Probar el BUS-05** en diferentes horarios para ver el cambio automático de ruta
2. **Escanear varios días seguidos** para construir una racha 🔥
3. **Ver el leaderboard**: `http://localhost:8000/api/leaderboard`
4. **Revisar las estadísticas** en la interfaz

---

¡Disfruta probando el sistema UIDE-Link! 🎉
