import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductExtraAttributeDefinition } from './product-extra-attribute-definition';

describe('ProductExtraAttributeDefinition', () => {
  let component: ProductExtraAttributeDefinition;
  let fixture: ComponentFixture<ProductExtraAttributeDefinition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductExtraAttributeDefinition],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductExtraAttributeDefinition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
