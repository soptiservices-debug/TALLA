// Inicializar con datos de prueba en localStorage
class ControlTrabajosTalla {
    constructor() {
        this.dbName = 'controlTrabajosTalla';
        this.storeName = 'trabajos';
        this.db = null;
        this.inicializar();
    }

    // Inicializar IndexedDB
    inicializar() {
        if (!window.indexedDB) {
            console.warn('IndexedDB no está disponible. Usando localStorage como fallback.');
            this.usarLocalStorage = true;
            return;
        }

        const request = window.indexedDB.open(this.dbName, 1);

        request.onerror = () => {
            console.error('Error al abrir la base de datos');
            this.usarLocalStorage = true;
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log('Base de datos inicializada');
            this.cargarUI();
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(this.storeName)) {
                const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('fecha', 'fecha', { unique: false });
                objectStore.createIndex('codigoBarras', 'codigoBarras', { unique: false });
            }
        };
    }

    // Guardar trabajo
    async guardarTrabajo(trabajo) {
        if (this.usarLocalStorage) {
            return this.guardarEnLocalStorage(trabajo);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.add(trabajo);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Error al guardar el trabajo');
            };
        });
    }

    // Obtener todos los trabajos
    async obtenerTodosTrabajo() {
        if (this.usarLocalStorage) {
            return this.obtenerDeLocalStorage();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject('Error al obtener los trabajos');
            };
        });
    }

    // LocalStorage fallback methods
    guardarEnLocalStorage(trabajo) {
        let trabajos = JSON.parse(localStorage.getItem(this.dbName) || '[]');
        trabajo.id = Date.now();
        trabajo.timestamp = new Date().toISOString();
        trabajos.push(trabajo);
        localStorage.setItem(this.dbName, JSON.stringify(trabajos));
        return trabajo.id;
    }

    obtenerDeLocalStorage() {
        return JSON.parse(localStorage.getItem(this.dbName) || '[]');
    }

    eliminarDeLocalStorage(id) {
        let trabajos = JSON.parse(localStorage.getItem(this.dbName) || '[]');
        trabajos = trabajos.filter(t => t.id !== id);
        localStorage.setItem(this.dbName, JSON.stringify(trabajos));
    }

    // Eliminar trabajo
    async eliminarTrabajo(id) {
        if (this.usarLocalStorage) {
            return this.eliminarDeLocalStorage(id);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject('Error al eliminar el trabajo');
            };
        });
    }

    // Cargar la UI
    cargarUI() {
        this.configurarEventos();
        this.establecerFechaActual();
        this.establecerHoraActual();
        this.determinarTurnoAutomatico(); // Seleccionar turno automáticamente según hora
        this.cargarListado();
        this.cargarUltimosRegistros();
    }

    // Configurar eventos
    configurarEventos() {
        // Navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.cambiarSeccion(e.target.dataset.section));
        });

        // Formulario de registro
        document.getElementById('formRegistro').addEventListener('submit', (e) => this.handleRegistro(e));

        // Evento de tecla para escaneo automático (incrementar contador)
        document.getElementById('codigoBarras').addEventListener('keypress', (e) => this.manejarEscaneoBarras(e));

        // Botones de reset para T1 y T2
        document.getElementById('btnResetT1').addEventListener('click', () => this.resetContador('t1'));
        document.getElementById('btnResetT2').addEventListener('click', () => this.resetContador('t2'));

        // Evento para guardar turno seleccionado
        document.getElementById('turno').addEventListener('change', (e) => {
            if (e.target.value) {
                localStorage.setItem('turnoSeleccionado', e.target.value);
            }
        });

        // Filtros
        document.getElementById('btnFiltrar').addEventListener('click', () => this.cargarListado());
        document.getElementById('btnLimpiarFiltros').addEventListener('click', () => this.limpiarFiltros());

        // Reportes
        document.getElementById('btnGenerarSemanal').addEventListener('click', () => this.generarReporteSemanal());
        document.getElementById('btnGenerarMensual').addEventListener('click', () => this.generarReporteMensual());
        document.getElementById('btnGenerarAnual').addEventListener('click', () => this.generarReporteAnual());
        document.getElementById('btnGenerarDiario').addEventListener('click', () => this.generarReporteDiario());

        // Focus en campo de código de barras
        document.getElementById('codigoBarras').focus();
    }

    // Cambiar sección
    cambiarSeccion(seccion) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        // Mostrar la sección seleccionada
        document.getElementById(seccion).classList.add('active');
        document.querySelector(`[data-section="${seccion}"]`).classList.add('active');

        // Recargar datos según la sección
        if (seccion === 'listado') {
            this.cargarListado();
        } else if (seccion === 'reportes') {
            this.establecerFechaReporte();
        }

        // Focus en código de barras si es registro
        if (seccion === 'registro') {
            // Verificar y actualizar turno automático al volver a registro
            this.establecerFechaActual();
            this.establecerHoraActual();
            this.determinarTurnoAutomatico();
            document.getElementById('codigoBarras').focus();
        }
    }

    // Establecer fecha actual
    establecerFechaActual() {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaLocal = `${año}-${mes}-${dia}`;
        document.getElementById('fecha').value = fechaLocal;
    }

    // Establecer hora actual
    establecerHoraActual() {
        const ahora = new Date();
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        document.getElementById('hora').value = `${horas}:${minutos}`;
    }

    // Cargar turno guardado
    cargarTurnoGuardado() {
        const turnoGuardado = localStorage.getItem('turnoSeleccionado');
        if (turnoGuardado) {
            document.getElementById('turno').value = turnoGuardado;
        }
    }

    // Determinar turno automáticamente según la hora
    determinarTurnoAutomatico() {
        const ahora = new Date();
        const hora = ahora.getHours();
        
        // T1: 12:00 AM (0) a 11:59 AM (11)
        // T2: 12:00 PM (12) a 11:59 PM (23)
        
        let turnoAutomatico = '';
        let horaInicio = '';
        let horaFin = '';
        
        // Nuevo horario: T1 00:00 - 13:59, T2 14:00 - 23:59
        if (hora >= 0 && hora < 14) {
            turnoAutomatico = 'T1';
            horaInicio = '12:00 AM';
            horaFin = '1:59 PM';
        } else if (hora >= 14 && hora < 24) {
            turnoAutomatico = 'T2';
            horaInicio = '2:00 PM';
            horaFin = '11:59 PM';
        }
        
        if (turnoAutomatico) {
            document.getElementById('turno').value = turnoAutomatico;
            // Actualizar indicador visual
            const indicador = document.getElementById('indicadorTurno');
            if (indicador) {
                indicador.textContent = `🕐 ${turnoAutomatico} (${horaInicio} - ${horaFin})`;
                indicador.style.color = turnoAutomatico === 'T1' ? '#00a8e8' : '#ff9800';
            }
            // Guardar en localStorage para que se recuerde
            localStorage.setItem('turnoSeleccionado', turnoAutomatico);
        }
    }

    // Establecer fechas en reportes
    establecerFechaReporte() {
        const hoy = new Date();
        document.getElementById('mesReporte').valueAsDate = hoy;
        document.getElementById('anioReporte').value = hoy.getFullYear();

        // Establecer fecha del día actual para reporte diario
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        document.getElementById('diaReporte').value = `${año}-${mes}-${dia}`;

        // Calcular semana actual
        const fecha = new Date(hoy);
        const diaSemana = fecha.getDay();
        const diff = fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
        const lunes = new Date(fecha.setDate(diff));
        const yearSemana = lunes.getFullYear();
        const semana = this.obtenerNumeroSemana(lunes);
        document.getElementById('semanaReporte').value = `${yearSemana}-W${String(semana).padStart(2, '0')}`;
    }

    // Obtener número de semana
    obtenerNumeroSemana(date) {
        const primera = new Date(date.getFullYear(), 0, 1);
        const diasDiferencia = (date - primera) / (24 * 60 * 60 * 1000);
        return Math.ceil((diasDiferencia + primera.getDay() + 1) / 7);
    }

    // Manejar escaneo de código (auto-incrementar contador y auto-registrar)
    async manejarEscaneoBarras(e) {
        // Si presiona Enter en el campo de código de barras
        if (e.key === 'Enter') {
            e.preventDefault();

            const codigoBarras = document.getElementById('codigoBarras').value.trim();
            const turno = document.getElementById('turno').value;

            if (!codigoBarras || !turno) {
                this.mostrarMensaje('Completa código de barras y turno', 'error');
                document.getElementById('codigoBarras').focus();
                return;
            }

            // Incrementar el contador según el turno
            if (turno === 'T1') {
                const t1Actual = parseInt(document.getElementById('t1').value) || 0;
                document.getElementById('t1').value = t1Actual + 1;
            } else if (turno === 'T2') {
                const t2Actual = parseInt(document.getElementById('t2').value) || 0;
                document.getElementById('t2').value = t2Actual + 1;
            }

            // Mostrar confirmación del incremento
            const turnoActual = turno === 'T1' 
                ? `T1: ${document.getElementById('t1').value}` 
                : `T2: ${document.getElementById('t2').value}`;
            this.mostrarMensaje(`Código registrado - ${turnoActual}`, 'exito');

            // Preparar y guardar el trabajo automáticamente
            // Actualizar fecha y hora al momento del escaneo
            this.establecerFechaActual();
            this.establecerHoraActual();
            
            const fecha = document.getElementById('fecha').value;
            const hora = document.getElementById('hora').value;
            
            // Guardar 1 por cada escaneo, dependiendo del turno
            let t1 = 0;
            let t2 = 0;
            if (turno === 'T1') {
                t1 = 1;
            } else if (turno === 'T2') {
                t2 = 1;
            }

            const trabajo = {
                codigoBarras,
                fecha,
                hora,
                turno,
                t1,
                t2,
                total: t1 + t2,
                timestamp: new Date().toISOString()
            };

            try {
                await this.guardarTrabajo(trabajo);
                // Actualizar UI
                this.cargarUltimosRegistros();
                this.cargarListado();
            } catch (err) {
                console.error('Error guardando trabajo automático:', err);
                this.mostrarMensaje('Error guardando registro', 'error');
            }

            document.getElementById('codigoBarras').value = '';
            document.getElementById('codigoBarras').focus();
        }
    }

    // Resetear contador de T1 o T2
    resetContador(tipo) {
        if (confirm(`¿Deseas reiniciar el contador de ${tipo.toUpperCase()}?`)) {
            document.getElementById(tipo).value = 0;
            this.mostrarMensaje(`Contador ${tipo.toUpperCase()} reiniciado`, 'exito');
        }
    }

    // Manejar registro
    async handleRegistro(e) {
        e.preventDefault();

        const codigoBarras = document.getElementById('codigoBarras').value.trim();
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const turno = document.getElementById('turno').value;
        const t1 = parseInt(document.getElementById('t1').value) || 0;
        const t2 = parseInt(document.getElementById('t2').value) || 0;

        if (!codigoBarras || !fecha || !hora || !turno) {
            this.mostrarMensaje('Por favor, completa todos los campos', 'error');
            return;
        }

        const trabajo = {
            codigoBarras,
            fecha,
            hora,
            turno,
            t1,
            t2,
            total: t1 + t2,
            timestamp: new Date().toISOString()
        };

        try {
            await this.guardarTrabajo(trabajo);
            this.mostrarMensaje('Trabajo registrado correctamente', 'exito');

            // Limpiar formulario - SOLO el código de barras
            document.getElementById('codigoBarras').value = '';
            
            // Actualizar fecha y hora (por si cambió la hora)
            this.establecerFechaActual();
            this.establecerHoraActual();
            
            // Turno se mantiene (NO se resetea)
            // T1 y T2 se mantienen (NO se resetean)
            
            document.getElementById('codigoBarras').focus();

            // Actualizar últimos registros
            this.cargarUltimosRegistros();
        } catch (error) {
            this.mostrarMensaje(error, 'error');
        }
    }

    // Mostrar mensaje
    mostrarMensaje(texto, tipo) {
        const elemento = document.getElementById('mensajeRegistro');
        elemento.textContent = texto;
        elemento.className = `mensaje ${tipo}`;
        setTimeout(() => {
            elemento.className = 'mensaje';
        }, 3000);
    }

    // Cargar últimos registros
    async cargarUltimosRegistros() {
        const trabajos = await this.obtenerTodosTrabajo();
        const ultimos = trabajos.slice(-5).reverse();

        const contenedor = document.getElementById('ultimosRegistros');
        if (ultimos.length === 0) {
            contenedor.innerHTML = '<p class="sin-datos">No hay registros aún</p>';
            return;
        }

        contenedor.innerHTML = ultimos.map(t => `
            <div class="registro-card">
                <p><strong>Código:</strong> ${t.codigoBarras}</p>
                <p><strong>Fecha:</strong> ${this.formatearFecha(t.fecha)}</p>
                <p><strong>Hora:</strong> ${t.hora}</p>
                <p><strong>Turno:</strong> ${t.turno}</p>
                <p><strong>T1:</strong> ${t.t1} | <strong>T2:</strong> ${t.t2} | <strong>Total:</strong> ${t.total}</p>
            </div>
        `).join('');
    }

    // Cargar listado
    async cargarListado() {
        const trabajos = await this.obtenerTodosTrabajo();
        
        // Aplicar filtros
        let trabajosFiltrados = trabajos;

        const mes = document.getElementById('filtroMes').value;
        if (mes) {
            trabajosFiltrados = trabajosFiltrados.filter(t => t.fecha.startsWith(mes));
        }

        const fecha = document.getElementById('filtroFecha').value;
        if (fecha) {
            trabajosFiltrados = trabajosFiltrados.filter(t => t.fecha === fecha);
        }

        // Ordenar por fecha descendente
        trabajosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const tbody = document.getElementById('tbodyListado');
        if (trabajosFiltrados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="sin-datos">No hay datos para mostrar</td></tr>';
            return;
        }

        tbody.innerHTML = trabajosFiltrados.map(t => `
            <tr>
                <td>${t.codigoBarras}</td>
                <td>${this.formatearFecha(t.fecha)}</td>
                <td>${t.hora}</td>
                <td>${t.turno}</td>
                <td>${t.t1}</td>
                <td>${t.t2}</td>
                <td><strong>${t.total}</strong></td>
                <td><button class="btn btn-danger" onclick="app.eliminarRegistro(${t.id})">Eliminar</button></td>
            </tr>
        `).join('');
    }

    // Limpiar filtros
    limpiarFiltros() {
        document.getElementById('filtroMes').value = '';
        document.getElementById('filtroFecha').value = '';
        this.cargarListado();
    }

    // Eliminar registro
    async eliminarRegistro(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
            try {
                await this.eliminarTrabajo(id);
                this.cargarListado();
                this.cargarUltimosRegistros();
            } catch (error) {
                alert('Error al eliminar: ' + error);
            }
        }
    }

    // Generar reporte semanal
    async generarReporteSemanal() {
        const semana = document.getElementById('semanaReporte').value;
        if (!semana) {
            alert('Selecciona una semana');
            return;
        }

        const [año, numeroSemana] = semana.split('-W').map(Number);
        const trabajos = await this.obtenerTodosTrabajo();

        const trabajosSemana = trabajos.filter(t => {
            const fecha = new Date(t.fecha);
            const semanaFecha = this.obtenerNumeroSemana(fecha);
            return fecha.getFullYear() === año && semanaFecha === numeroSemana;
        });

        this.mostrarReporte('Reporte Semanal', `Semana ${numeroSemana} de ${año}`, trabajosSemana);
    }

    // Generar reporte mensual
    async generarReporteMensual() {
        const mes = document.getElementById('mesReporte').value;
        if (!mes) {
            alert('Selecciona un mes');
            return;
        }

        const trabajos = await this.obtenerTodosTrabajo();
        const trabajosMes = trabajos.filter(t => t.fecha.startsWith(mes));

        const fecha = new Date(mes + '-01');
        const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        this.mostrarReporte('Reporte Mensual', nombreMes, trabajosMes);
    }

    // Generar reporte anual
    async generarReporteAnual() {
        const año = document.getElementById('anioReporte').value;
        if (!año) {
            alert('Selecciona un año');
            return;
        }

        const trabajos = await this.obtenerTodosTrabajo();
        const trabajosAño = trabajos.filter(t => t.fecha.startsWith(año.toString()));

        this.mostrarReporte('Reporte Anual', `Año ${año}`, trabajosAño);
    }

    async generarReporteDiario() {
        const dia = document.getElementById('diaReporte').value;
        if (!dia) {
            alert('Selecciona una fecha');
            return;
        }

        const trabajos = await this.obtenerTodosTrabajo();
        const trabajosDia = trabajos.filter(t => t.fecha === dia);

        const fecha = new Date(dia + 'T00:00:00');
        const fechaFormato = fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        this.mostrarReporte('Reporte Diario', fechaFormato, trabajosDia);
    }

    // Mostrar reporte
    mostrarReporte(titulo, subtitulo, trabajos) {
        if (trabajos.length === 0) {
            document.getElementById('resultadoReporte').innerHTML = `
                <h3>${titulo}</h3>
                <p class="sin-datos">No hay datos para este período</p>
            `;
            return;
        }

        // Agrupar por código de barras
        const agrupados = {};
        trabajos.forEach(t => {
            if (!agrupados[t.codigoBarras]) {
                agrupados[t.codigoBarras] = {
                    codigo: t.codigoBarras,
                    trabajos: [],
                    totalT1: 0,
                    totalT2: 0,
                    total: 0
                };
            }
            agrupados[t.codigoBarras].trabajos.push(t);
            // Contar cantidad de registros por turno (1 por cada registro, no sumar valores)
            if (t.turno === 'T1') {
                agrupados[t.codigoBarras].totalT1 += 1;
            } else if (t.turno === 'T2') {
                agrupados[t.codigoBarras].totalT2 += 1;
            }
            agrupados[t.codigoBarras].total += 1; // Contar 1 por cada registro
        });

        // Calcular totales generales
        let totalGeneralT1 = 0, totalGeneralT2 = 0, totalGeneral = 0;
        Object.values(agrupados).forEach(grupo => {
            totalGeneralT1 += grupo.totalT1;
            totalGeneralT2 += grupo.totalT2;
            totalGeneral += grupo.total;
        });

        let html = `
            <h3>${titulo}</h3>
            <p><strong>${subtitulo}</strong></p>
            <table class="reporte-tabla">
                <thead>
                    <tr>
                        <th>Código de Barras</th>
                        <th>Cantidad de Registros</th>
                        <th>T1</th>
                        <th>T2</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.values(agrupados).forEach(grupo => {
            html += `
                <tr>
                    <td>${grupo.codigo}</td>
                    <td>${grupo.trabajos.length}</td>
                    <td>${grupo.totalT1}</td>
                    <td>${grupo.totalT2}</td>
                    <td><strong>${grupo.total}</strong></td>
                </tr>
            `;
        });

        html += `
                    <tr style="background-color: #f0f0f0; font-weight: bold;">
                        <td>TOTAL</td>
                        <td>${Object.values(agrupados).reduce((sum, g) => sum + g.trabajos.length, 0)}</td>
                        <td>${totalGeneralT1}</td>
                        <td>${totalGeneralT2}</td>
                        <td>${totalGeneral}</td>
                    </tr>
                </tbody>
            </table>

            <div class="reporte-resumen">
                <div class="resumen-item">
                    <div class="label">Total T1</div>
                    <div class="valor">${totalGeneralT1}</div>
                </div>
                <div class="resumen-item">
                    <div class="label">Total T2</div>
                    <div class="valor">${totalGeneralT2}</div>
                </div>
                <div class="resumen-item">
                    <div class="label">Total General</div>
                    <div class="valor">${totalGeneral}</div>
                </div>
            </div>

            <div style="margin-top: 20px; text-align: center;">
                <button class="btn btn-primary" onclick="window.print()">Imprimir Reporte</button>
                <button class="btn btn-secondary" onclick="app.descargarReporteCSV('${titulo}', ${JSON.stringify(Object.values(agrupados)).replace(/"/g, '&quot;')})">Descargar CSV</button>
            </div>
        `;

        document.getElementById('resultadoReporte').innerHTML = html;
    }

    // Descargar reporte como Excel (.xlsx)
    descargarReporteCSV(titulo, datos) {
        let csv = `${titulo}\n\n`;
        csv += 'Código de Barras,Registros,T1,T2,Total\n';

        datos.forEach(grupo => {
            csv += `${grupo.codigo},${grupo.trabajos.length},${grupo.totalT1},${grupo.totalT2},${grupo.total}\n`;
        });

        const elemento = document.createElement('a');
        elemento.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        elemento.setAttribute('download', `reporte_${new Date().toISOString().split('T')[0]}.csv`);
        elemento.style.display = 'none';
        document.body.appendChild(elemento);
        elemento.click();
        document.body.removeChild(elemento);
    }

    // Formatear fecha
    formatearFecha(fecha) {
        // Interpretar fecha como local (YYYY-MM-DD) en lugar de UTC
        const [año, mes, dia] = fecha.split('-');
        const fechaLocal = new Date(año, mes - 1, dia);
        return fechaLocal.toLocaleDateString('es-ES', { 
            weekday: 'short',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

// Instanciar la aplicación cuando el DOM esté listo
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ControlTrabajosTalla();
});
