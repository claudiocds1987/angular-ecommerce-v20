import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toast } from './toast';
import { ToastService, ToastConfig } from '../../services/toast-service';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('Toast Component', () => {
  let component: Toast;
  let fixture: ComponentFixture<Toast>;

  // Tipamos el mock explícitamente con la estructura del servicio
  let toastServiceMock: { config: WritableSignal<ToastConfig | null> };

  // Creamos el signal real que usaremos para controlar los tests
  const configSignal = signal<ToastConfig | null>(null);

  beforeEach(async () => {
    // Definimos el mock con el signal
    toastServiceMock = {
      config: configSignal,
    };

    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [
        // Inyectamos el mock en lugar del servicio real
        { provide: ToastService, useValue: toastServiceMock },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;

    // Limpiamos el estado antes de cada prueba
    configSignal.set(null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should NOT show anything when config is null', () => {
    const toastDiv = fixture.debugElement.query(By.css('.fixed'));
    expect(toastDiv).toBeFalsy();
  });

  it('should show message and correct styles for "success" type', async () => {
    configSignal.set({
      message: 'Operación exitosa',
      type: 'success',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    const messageElement = fixture.debugElement.query(By.css('span')).nativeElement;
    const toastDiv = fixture.debugElement.query(By.css('.fixed')).nativeElement;

    expect(messageElement.textContent).toContain('Operación exitosa');
    expect(toastDiv.classList).toContain('bg-emerald-600/90');
  });

  it('should trigger showAnimation after a small delay when config is set', async () => {
    configSignal.set({ message: 'Animación test', type: 'warning' });

    fixture.detectChanges();
    // Esperamos el setTimeout(..., 10) del constructor
    await new Promise((resolve) => setTimeout(resolve, 20));
    fixture.detectChanges();

    expect(component.showAnimation()).toBeTrue();

    const toastDiv = fixture.debugElement.query(By.css('.fixed')).nativeElement;
    expect(toastDiv.classList).toContain('opacity-100');
  });

  it('should call close and eventually set config to null', async () => {
    configSignal.set({ message: 'Cerrando', type: 'success' });
    fixture.detectChanges();

    component.close();

    expect(component.showAnimation()).toBeFalse();

    // Esperamos el setTimeout(..., 300) del método close()
    await new Promise((resolve) => setTimeout(resolve, 310));

    expect(configSignal()).toBeNull();
  });

  it('should render the correct icon based on type', async () => {
    configSignal.set({ message: 'Icono Test', type: 'warning' });
    fixture.detectChanges();
    await fixture.whenStable();

    const svg = fixture.debugElement.query(By.css('svg.text-black'));
    expect(svg).toBeTruthy();
  });
});
