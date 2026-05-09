import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductExtraAttributeForm } from './product-extra-attribute-form';

describe('ProductExtraAttributeForm', () => {
  let component: ProductExtraAttributeForm;
  let fixture: ComponentFixture<ProductExtraAttributeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductExtraAttributeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductExtraAttributeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
