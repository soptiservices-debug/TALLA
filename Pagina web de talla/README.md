# Control Trabajos Talla - Optiservices

Una aplicación web completa para gestionar el registro de trabajos con lectura de códigos de barras, organización por fecha/mes/año y generación de reportes.

## Características

✅ **Registro de Trabajos**
- Entrada rápida de códigos de barras
- Registro automático de fecha y hora
- Selección de turno (T1, T2)
- Entrada de cantidades por turno

✅ **Organización de Datos**
- Almacenamiento automático en base de datos local (IndexedDB)
- Visualización de últimos registros
- Listado completo con filtros por fecha y mes

✅ **Reportes Avanzados**
- Reporte por Semana
- Reporte por Mes
- Reporte por Año
- Agrupación por código de barras
- Cálculo automático de totales

✅ **Funcionalidades Adicionales**
- Exportación a CSV
- Impresión de reportes
- Eliminación de registros
- Interfaz responsiva (Desktop y Móvil)
- Almacenamiento local sin servidor

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Lector de códigos de barras (opcional, cualquier dispositivo compatible)

## Instalación

1. Descarga los archivos:
   - `index.html`
   - `styles.css`
   - `app.js`

2. Coloca todos los archivos en la misma carpeta

3. Abre `index.html` en tu navegador web

## Uso

### 1. Registro de Trabajo

1. Ve a la sección "REGISTRO"
2. El cursor estará automáticamente en el campo "Código de Barras"
3. Escanea el código de barras (o escribe manualmente)
4. La fecha y hora se establecerán automáticamente
5. Selecciona el turno (T1 o T2)
6. Ingresa la cantidad de trabajos para cada turno
7. Haz clic en "Registrar Trabajo"

**Tip:** Puedes escanear códigos continuamente sin necesidad de hacer clic entre escaneos.

### 2. Visualizar Listado

1. Ve a la sección "LISTADO"
2. Verás todos los registros en una tabla
3. Usa los filtros para:
   - Filtrar por mes específico
   - Filtrar por fecha exacta
4. Puedes eliminar registros individuales si es necesario

### 3. Generar Reportes

Ve a la sección "REPORTES" y elige:

**Reporte Semanal:**
- Selecciona la semana
- Se mostrarán todos los trabajos de esa semana
- Totales por código de barras y general

**Reporte Mensual:**
- Selecciona el mes
- Se mostrarán todos los trabajos del mes
- Análisis completo con totales

**Reporte Anual:**
- Selecciona el año
- Se mostrarán todos los trabajos del año
- Resumen anual completo

**Opciones del Reporte:**
- 🖨️ Imprimir: Abre el cuadro de diálogo de impresión
- 📥 Descargar CSV: Exporta los datos en formato Excel/CSV

## Estructura de Datos

Cada registro contiene:
- **Código de Barras (JOB)**: Identificador del trabajo
- **Fecha**: Fecha del registro
- **Hora**: Hora del registro
- **Turno**: T1 o T2
- **T1**: Cantidad en turno 1
- **T2**: Cantidad en turno 2
- **Total**: Suma de T1 y T2

## Almacenamiento

Los datos se almacenan en tu navegador:
- **Método principal**: IndexedDB (base de datos local)
- **Método alternativo**: LocalStorage (si IndexedDB no está disponible)
- **Ventaja**: No necesita servidor, datos privados, acceso rápido

**Importante:** Los datos se almacenan localmente en tu dispositivo. Para backup, usa la opción de exportar CSV regularmente.

## Atajos de Teclado

- **Registro activo**: El cursor permanece en el campo de código de barras
- **Tab**: Navega entre campos
- **Enter**: En el campo de código, mueve al siguiente campo
- **Ctrl+P**: Abre la impresora (desde reportes)

## Consejos de Uso

1. **Escaneo rápido**: Usa un lector de códigos de barras para entrada rápida
2. **Respaldo**: Descarga reportes en CSV mensualmente
3. **Verificación**: Revisa el listado regularmente para corregir errores
4. **Limpieza**: Elimina registros duplicados si los hay

## Solución de Problemas

**P: ¿Dónde se guardan mis datos?**
R: En la base de datos de tu navegador (IndexedDB). Son privados y locales en tu dispositivo.

**P: ¿Qué pasa si limpio el caché del navegador?**
R: Se perderán los datos. Por eso es importante hacer backups exportando a CSV.

**P: ¿Puedo usar esto en múltiples computadoras?**
R: Sí, pero cada computadora tendrá su propia base de datos. Para sincronizar, exporta e importa datos manualmente.

**P: ¿Se requiere conexión a internet?**
R: No, la aplicación funciona completamente offline.

## Mejoras Futuras

- Sincronización en la nube
- Importación de datos (CSV)
- Gráficos y estadísticas
- Alertas y notificaciones
- Múltiples usuarios

## Soporte

Para problemas o sugerencias, revisa que:
1. Todos los archivos (.html, .css, .js) estén en la misma carpeta
2. El navegador sea relativamente reciente
3. JavaScript esté habilitado

---

**Versión:** 1.0
**Última actualización:** Noviembre 2025
**Empresa:** Optiservices
