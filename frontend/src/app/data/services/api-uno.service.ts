import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageProcess } from '../interfaces/image-process.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiUnoService {
  private http = inject(HttpClient);

  private readonly URL = 'https://congenial-disco-x59gjxprqp763pr9-8080.app.github.dev/api/v1/ia';

  getBaseUrl(): string {
    return 'https://congenial-disco-x59gjxprqp763pr9-8080.app.github.dev';
  }

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

  updateRecord(id: string, data: ImageProcess): Observable<ImageProcess> {
    return this.http.put<ImageProcess>(`${this.URL}/editar/${id}`, data);
  }

  deleteLogico(id: string): Observable<ImageProcess> {
    return this.http.patch<ImageProcess>(`${this.URL}/eliminar/${id}`, {id});
  }

  restoreRecord(id: string): Observable<ImageProcess> {
    return this.http.patch<ImageProcess>(`${this.URL}/restaurar/${id}`, {id});
  }
}
