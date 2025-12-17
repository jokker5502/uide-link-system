# 📋 INSTRUCCIONES RÁPIDAS - Sistema UIDE-Link

**Lee el archivo completo en**: `INSTRUCCIONES_PARA_GEMINI.md` en la carpeta `.gemini`

## 🚀 INICIO RÁPIDO

### 1. Iniciar Base de Datos PostgreSQL
```bash
# Windows: Services → PostgreSQL → Iniciar
# O ejecutar: net start postgresql-x64-XX
```

### 2. Iniciar Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### 3. Iniciar Frontend  
```bash
cd frontend/public
python -m http.server 3000
```

### 4. Abrir Aplicación
```
http://localhost:3000/student.html
```

---

## 🔑 CREDENCIALES

**Base de Datos**:
- Usuario: `uide`
- Contraseña: `Contra.123.contra`
- Base de datos: `uide_link`
- Puerto: `5432`

**Backend**: `http://localhost:8000`
**Frontend**: `http://localhost:3000`

---

## 🧪 PROBAR BUS CAMALEÓN

```bash
# Terminal nueva:
cd backend
python test_resolver.py
```

---

## 📱 ESCANEAR QR

Códigos QR guardados en:
`C:\Users\mvill\.gemini\antigravity\brain\5768dc98-ad6c-415d-8e6a-676bfd00d18b\`

O genera en: https://qr.io
- Texto: `UIDE-BUS-05`

---

## 🆘 PROBLEMAS COMUNES

**Error "could not connect"**: PostgreSQL no está corriendo
**Error "ModuleNotFoundError"**: `pip install -r requirements.txt`
**Error "relation does not exist"**: `psql -U uide -d uide_link -f database/schema.sql`

---

Ver **INSTRUCCIONES_PARA_GEMINI.md** para guía completa paso a paso.
