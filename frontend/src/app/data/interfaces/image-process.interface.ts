import { DatePipeConfig } from "@angular/common";

export interface ImageProcess {
  _id?: string;
  urlOriginal: string;
  urlResultado: string;
  imagenBinaria: string;
  tipoServicio: string;
  fechaCreacion?: DatePipeConfig;
  activo: boolean;
}
