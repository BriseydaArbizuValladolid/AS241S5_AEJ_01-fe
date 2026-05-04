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

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  obtenerHistorial() {
    this.cargando.set(true);
    this.apiService.getHistory().subscribe({
      next: (data) => {
        this.listado.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  abrirModal(item: ImageProcess) {
  this.itemSeleccionado = { ...item }; // Creamos una copia limpia
  this.mostrarModal = true;
}

  cerrarModal() {
    this.mostrarModal = false;
    this.itemSeleccionado = null;
  }

  limpiarUrl(url: string | undefined, id: string | undefined): SafeUrl {
  // Si no hay ID, devolvemos una imagen por defecto para evitar errores de consola
  if (!id) return 'assets/placeholder.png';

  // Si la URL es de Background Remover (ruta de archivo) o no existe, usamos el endpoint de ver-imagen
  if (!url || !url.startsWith('http')) {
    const baseJava = 'https://congenial-disco-x59gjxprqp763pr9-8080.app.github.dev/api/v1/ia';
    // Usamos el endpoint que SÍ te funcionaba antes para mostrar el resultado
    return this.sanitizer.bypassSecurityTrustUrl(`${baseJava}/ver-imagen/${id}`);
  }

  // Si es una URL externa (Anime), se muestra directo
  return this.sanitizer.bypassSecurityTrustUrl(url);
}
// Asegúrate de que el método acepte string
eliminar(id: string) {
  if (!id) return; // Validación extra
  if (confirm('¿Deseas inactivar este registro?')) {
    this.cargando.set(true);
    this.apiService.deleteLogico(id).subscribe({
      next: () => this.obtenerHistorial(),
      error: () => this.cargando.set(false)
    });
  }
}

guardarEdicion() {
  // Validamos que itemSeleccionado y su id existan
  if (!this.itemSeleccionado || !this.itemSeleccionado.id) return;

  this.cargando.set(true);
  this.apiService.updateRecord(this.itemSeleccionado.id, this.itemSeleccionado).subscribe({
    next: () => {
      this.cerrarModal();
      this.obtenerHistorial();
    },
    error: (err) => {
      console.error("Sigue dando 404. Revisa el /{id} en tu Java Controller", err);
      this.cargando.set(false);
    }
  });
}
  restaurar(id: string | undefined) {
    if (!id) return;
    this.cargando.set(true);
    this.apiService.updateRecord(id, { activo: true } as any).subscribe({
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

  procesarAnimacion() {
    const url = prompt('URL de imagen:');
    if (url) {
      this.cargando.set(true);
      this.apiService.convertToAnime(url).subscribe({
        next: () => this.obtenerHistorial(),
        error: () => this.cargando.set(false)
      });
    }
  }
}
