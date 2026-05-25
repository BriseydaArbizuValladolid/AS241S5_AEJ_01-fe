import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiUnoService } from '../../data/services/api-uno.service';
import { ImageProcess } from '../../data/interfaces/image-process.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiUnoService);
  private sanitizer = inject(DomSanitizer);

  public listado = signal<ImageProcess[]>([]);
  public cargando = signal<boolean>(false);
  public mostrarModal = false;
  public itemSeleccionado: ImageProcess | null = null;
  public imagenZoom: ImageProcess | null = null; // Control del Lightbox

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  // --- LÓGICA DE VISUALIZACIÓN ---
  verImagenGrande(item: ImageProcess) {
    this.imagenZoom = item;
  }

  cerrarZoom() {
    this.imagenZoom = null;
  }

// --- SERVICIOS API ---
  obtenerHistorial() {
    this.cargando.set(true);
    this.apiService.getHistory().subscribe({
      next: (data) => {
        // TRUCO DE CONTROL: Creamos una copia nueva del array.
        // Esto rompe la referencia vieja en memoria y obliga al Signal a redibujar el HTML.
        this.listado.set([...data]);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  // --- MÉTODO DE ELIMINADO LÓGICO ---
  eliminar(id: string | undefined) {
    if (!id) return;

    this.cargando.set(true);
    this.apiService.deleteLogico(id).subscribe({
      next: (res) => {
        console.log('¡Confirmado por el Backend en DB!', res);

        // SOLO si el servidor guardó con éxito, actualizamos la interfaz
        this.listado.update(listaActual =>
          listaActual.map(item => item.id === id ? { ...item, activo: false } : item)
        );

        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error: El backend rechazó la eliminación:', err);
        alert('No se pudo guardar el cambio en la base de datos.');
        this.cargando.set(false);
      }
    });
  }

  // --- MÉTODO PARA RESTAURAR ---
  restaurar(id: string | undefined) {
    if (!id) return;

    this.cargando.set(true);
    this.apiService.restoreRecord(id).subscribe({
      next: (res) => {
        console.log('¡Confirmado por el Backend en DB!', res);

        // SOLO si el servidor guardó con éxito, actualizamos la interfaz
        this.listado.update(listaActual =>
          listaActual.map(item => item.id === id ? { ...item, activo: true } : item)
        );

        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error: El backend rechazó la restauración:', err);
        this.cargando.set(false);
      }
    });
  }
  procesarAnimacion(url: string) {
    if (!url?.trim()) return alert('URL no válida');
    this.cargando.set(true);
    this.apiService.convertToAnime(url).subscribe({
      next: () => this.obtenerHistorial(),
      error: () => this.cargando.set(false)
    });
  }

  procesarFondo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.cargando.set(true);
      this.apiService.removeBackground(file).subscribe({
        next: () => this.obtenerHistorial(),
        error: () => this.cargando.set(false)
      });
    }
  }


  abrirModal(item: ImageProcess) {
    this.itemSeleccionado = { ...item };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.itemSeleccionado = null;
  }

  // --- MÉTODO PARA GUARDAR LA EDICIÓN ---
guardarEdicion() {
    if (!this.itemSeleccionado || !this.itemSeleccionado.id) return;

    this.cargando.set(true);

    // Guardamos una copia local de lo que el usuario editó en el modal
    const datosEditados = { ...this.itemSeleccionado };

    this.apiService.updateRecord(datosEditados.id!, datosEditados).subscribe({
      next: (res: ImageProcess) => {
        console.log('¡Edición guardada con éxito por el Backend!', res);

        // ACTUALIZACIÓN REACTIVA INMEDIATA:
        // Buscamos el elemento modificado y le inyectamos los nuevos datos
        // manteniendo los valores previos para no perder nada.
        this.listado.update(listaActual =>
          listaActual.map(item =>
            item.id === datosEditados.id
              ? { ...item, tipoServicio: datosEditados.tipoServicio, urlResultado: datosEditados.urlResultado }
              : item
          )
        );

        this.cargando.set(false);
        this.cerrarModal(); // Cerramos el modal de forma limpia
      },
      error: (err: any) => {
        console.error('Error al intentar editar el registro:', err);
        alert('Ocurrió un problema al guardar los cambios en la base de datos.');
        this.cargando.set(false);
      }
    });
  }
limpiarUrl(item: any): SafeUrl {
  if (!item) return 'assets/placeholder.png';

  if (item.urlResultado && item.urlResultado.startsWith('http')) {
    return this.sanitizer.bypassSecurityTrustUrl(item.urlResultado);
  }

  if (item.urlResultado === 'Error') {
    return 'assets/image-error.png';
  }

  const base = this.apiService.getBaseUrl();
  const urlFinal = item.urlResultado.startsWith('/')
                   ? `${base}${item.urlResultado}`
                   : `${base}/api/v1/ia/ver-imagen/${item.id}`;

  return this.sanitizer.bypassSecurityTrustUrl(urlFinal);
}
}
