import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageProcess } from '../interfaces/image-process.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiUnoService {
  private http = inject(HttpClient);

  // USA LA IP QUE TE FUNCIONÓ EN EL CURL
  private readonly URL = 'https://congenial-disco-x59gjxprqp763pr9-8080.app.github.dev/api/v1/ia';

  getHistory(): Observable<ImageProcess[]> {
    return this.http.get<ImageProcess[]>(`${this.URL}/listar`);
  }

  removeBackground(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.URL}/remover-fondo`, formData, { responseType: 'blob' });
  }

  convertToAnime(url: string): Observable<ImageProcess> {
    return this.http.post<ImageProcess>(`${this.URL}/convertir-anime?url=${url}`, {});
  }

  // --- ESTOS SON LOS QUE FALTAN SEGÚN TU IMAGEN ---

  updateRecord(id: string, data: Partial<ImageProcess>): Observable<ImageProcess> {
    return this.http.put<ImageProcess>(`${this.URL}/actualizar/${id}`, data);
  }

  deleteLogico(id: string): Observable<any> {
    // Llamamos al endpoint de desactivar que creamos en Java
    return this.http.put(`${this.URL}/desactivar/${id}`, {});
  }
}
