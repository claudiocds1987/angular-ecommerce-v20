import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPurchases } from './user-purchases';

describe('UserPurchases', () => {
  let component: UserPurchases;
  let fixture: ComponentFixture<UserPurchases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPurchases],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPurchases);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
