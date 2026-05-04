import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  // Inyectamos solo el servicio principal
  private apiService = inject(ApiUnoService);

  // Estados reactivos con Signals
  public listado = signal<ImageProcess[]>([]);
  public cargando = signal<boolean>(false);
  public mensajeStatus = signal<string>('');

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  // LISTAR: Obtiene los registros (el backend filtrará los activos: true)
  obtenerHistorial() {
    this.cargando.set(true);
    this.apiService.getHistory().subscribe({
      next: (data) => {
        this.listado.set(data);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('Error al traer historial de MongoDB', err);
        this.cargando.set(false);
      }
    });
  }

  // CREATE: Procesar remover fondo (con archivo)
  procesarFondo(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.cargando.set(true);
      this.mensajeStatus.set('Removiendo fondo...');

      this.apiService.removeBackground(input.files[0]).subscribe({
        next: () => {
          this.obtenerHistorial(); // Refrescamos la lista para ver el nuevo registro
          this.mensajeStatus.set('Fondo removido con éxito');
        },
        error: (err) => this.manejarError(err)
      });
    }
  }

  // CREATE: Procesar animación (con URL)
  procesarAnimacion() {
    const url = prompt('Ingresa la URL de la imagen para animar:');
    if (url) {
      this.cargando.set(true);
      this.mensajeStatus.set('Convirtiendo a anime...');

      this.apiService.convertToAnime(url).subscribe({
        next: (res) => {
          this.listado.update(actual => [res, ...actual]);
          this.cargando.set(false);
          this.mensajeStatus.set('¡Animación completada!');
        },
        error: (err) => this.manejarError(err)
      });
    }
  }

  // UPDATE: Editar un registro existente
  editar(item: ImageProcess) {
    const nuevoTipo = prompt('Editar tipo de servicio:', item.tipoServicio);
    if (nuevoTipo && item._id) {
      this.apiService.updateRecord(item._id, { tipoServicio: nuevoTipo }).subscribe({
        next: (actualizado) => {
          // Actualizamos localmente el signal
          this.listado.update(actual =>
            actual.map(i => i._id === actualizado._id ? actualizado : i)
          );
          this.mensajeStatus.set('Registro actualizado');
        },
        error: (err) => this.manejarError(err)
      });
    }
  }

  // DELETE: Borrado Lógico
  eliminar(id?: string) {
    if (!id) return;
    if (confirm('¿Estás seguro de enviar este registro a la papelera (Borrado Lógico)?')) {
      this.apiService.deleteLogico(id).subscribe({
        next: () => {
          // Filtramos del signal para que desaparezca de la vista inmediatamente
          this.listado.update(actual => actual.filter(item => item._id !== id));
          this.mensajeStatus.set('Registro desactivado correctamente');
        },
        error: (err: any) => console.error('Error al eliminar', err)
      });
    }
  }

  private manejarError(err: any) {
    console.error('Error en el proceso:', err);
    this.cargando.set(false);
    this.mensajeStatus.set('Ocurrió un error. Revisa la consola.');
  }
}
