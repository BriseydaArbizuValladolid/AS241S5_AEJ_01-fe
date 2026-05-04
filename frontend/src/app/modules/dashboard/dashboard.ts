import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiUnoService } from '../../data/services/api-uno.service';
import { ImageProcess } from '../../data/interfaces/image-process.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiUnoService);
  private sanitizer = inject(DomSanitizer);

  public listado = signal<ImageProcess[]>([]);
  public cargando = signal<boolean>(false);
  public mensajeStatus = signal<string>('');

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  // Sanea URLs externas (Originales)
  // En dashboard.component.ts

limpiarUrl(url: string | undefined): SafeUrl {
  if (!url || url.length < 5) return '';

  const servidorBase = 'https://congenial-disco-x59gjxprqp763pr9-8080.app.github.dev';
  let urlFinal = url;

  // Si la URL empieza con /api (tanto para original como resultado), le ponemos el servidor
  if (url.startsWith('/api')) {
    urlFinal = `${servidorBase}${url}`;
  }
  // Si no empieza con http ni con /api, asumimos que es un nombre de archivo viejo
  else if (!url.startsWith('http')) {
    urlFinal = `${servidorBase}/api/v1/ia/ver-imagen-original/${url}`;
  }

  return this.sanitizer.bypassSecurityTrustUrl(urlFinal);
}

  obtenerHistorial() {
  this.cargando.set(true);
  this.apiService.getHistory().subscribe({
    next: (data) => {
      // Forzamos que todos los items tengan activo = true al llegar al front
      const listaForzada = data.map(item => ({ ...item, activo: true }));
      this.listado.set(listaForzada);
      this.cargando.set(false);
    },
    error: () => this.manejarError('Error al cargar historial')
  });
}

  // --- MÉTODOS DE ACCIÓN ---

  editar(item: ImageProcess) {
    const nuevoTipo = prompt('Editar tipo de servicio:', item.tipoServicio);
    if (nuevoTipo && item._id) {
      this.cargando.set(true);
      // Enviamos el objeto completo como espera tu @RequestBody ApiModel
      const actualizado: ImageProcess = { ...item, tipoServicio: nuevoTipo };

      this.apiService.updateRecord(item._id, actualizado).subscribe({
        next: () => {
          this.obtenerHistorial(); // Refrescamos para ver cambios
          this.mensajeStatus.set('Registro actualizado');
        },
        error: () => this.manejarError('No se pudo actualizar')
      });
    }
  }

  eliminar(id?: string) {
  if (!id) return;

  if (confirm('¿Deseas eliminar este registro?')) {
    this.apiService.deleteLogico(id).subscribe({
      next: () => {
        // Cambiamos item.id por item._id
        this.listado.update(lista => lista.filter(item => item._id !== id));
        this.cargando.set(false);
      },
      error: (err) => {
        console.error("Error al eliminar", err);
        this.cargando.set(false);
      }
    });
  }
}
  // Métodos de procesamiento (Fondo y Anime)
  procesarFondo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.cargando.set(true);
      this.mensajeStatus.set('Removiendo fondo...');
      this.apiService.removeBackground(file).subscribe({
        next: () => this.obtenerHistorial(),
        error: () => this.manejarError('Error en proceso de fondo')
      });
    }
  }

  procesarAnimacion() {
    const url = prompt('URL de la imagen:');
    if (url) {
      this.cargando.set(true);
      this.apiService.convertToAnime(url).subscribe({
        next: () => this.obtenerHistorial(),
        error: () => this.manejarError('Error en efecto anime')
      });
    }
  }

  private manejarError(msg: string) {
    this.cargando.set(false);
    this.mensajeStatus.set(msg);
    setTimeout(() => this.mensajeStatus.set(''), 3000);
  }
}
