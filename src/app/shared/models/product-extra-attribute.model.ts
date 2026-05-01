export interface ProductExtraAttribute {
  name: string; // coincidirá con 'name' de tu DB (ej: "Es Smart")
  label: string; // usaremos el name para la etiqueta visual
  dataType: 'text' | 'number' | 'boolean'; // los tipos que veo en tu imagen
  value?: string;
  required?: boolean;
}
