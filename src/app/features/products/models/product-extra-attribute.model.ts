export interface AttributeValidations {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface ProductExtraAttribute {
  id: number;
  name: string;
  label: string;
  dataType: 'text' | 'number' | 'boolean' | 'date';
  categoryId: number;
  validations: AttributeValidations;
}
