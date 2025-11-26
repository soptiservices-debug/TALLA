# Servidor local para Control Trabajos Talla
# Ejecutar con: powershell -File servidor.ps1

$puerto = 8000
$carpeta = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

# Crear listener HTTP
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$puerto/")
$listener.Start()
Write-Host "Servidor iniciado en http://localhost:$puerto/" -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow

try {
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Obtener ruta solicitada
        $rutaSolicitada = $request.Url.LocalPath
        if ($rutaSolicitada -eq "/") { $rutaSolicitada = "/index.html" }
        
        $archivo = Join-Path $carpeta $rutaSolicitada.Substring(1)
        
        # Enviar respuesta
        if (Test-Path $archivo) {
            $contenido = [System.IO.File]::ReadAllBytes($archivo)
            $response.ContentLength64 = $contenido.Length
            
            # Establecer tipo de contenido
            if ($archivo.EndsWith(".html")) { $response.ContentType = "text/html; charset=utf-8" }
            elseif ($archivo.EndsWith(".css")) { $response.ContentType = "text/css; charset=utf-8" }
            elseif ($archivo.EndsWith(".js")) { $response.ContentType = "application/javascript; charset=utf-8" }
            elseif ($archivo.EndsWith(".json")) { $response.ContentType = "application/json; charset=utf-8" }
            
            $response.OutputStream.Write($contenido, 0, $contenido.Length)
            Write-Host "GET $rutaSolicitada - 200 OK" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            $response.ContentType = "text/plain"
            $contenido = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado")
            $response.ContentLength64 = $contenido.Length
            $response.OutputStream.Write($contenido, 0, $contenido.Length)
            Write-Host "GET $rutaSolicitada - 404 NOT FOUND" -ForegroundColor Red
        }
        
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
