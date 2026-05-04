import { DatePipeConfig } from "@angular/common";

export interface ImageProcess {
  id: string;
  urlOriginal: string;
  urlResultado: string;
  imagenBinaria: string;
  tipoServicio: string;
  fechaCreacion?: string;
  activo?: boolean;
}
