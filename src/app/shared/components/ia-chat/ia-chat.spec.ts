import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { IaChatService } from '../../services/ia-chat-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { IaChat } from './ia-chat';
import { Product } from '../../models/product.model';
import { GeminiResponse } from '../../models/gemini-response.model';

describe('IaChat', () => {
  let component: IaChat;
  let fixture: ComponentFixture<IaChat>;
  let iaChatServiceMock: jasmine.SpyObj<IaChatService>;

  beforeEach(async () => {
    // 1. Arrange: Configuración del Mock profesional
    iaChatServiceMock = jasmine.createSpyObj('IaChatService', [
      'sendPromptToAI',
      'askAboutProduct',
      'closeIAChat',
    ]);

    await TestBed.configureTestingModule({
      imports: [IaChat, CommonModule, FormsModule],
      providers: [
        { provide: IaChatService, useValue: iaChatServiceMock },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IaChat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- Caso de prueba 1: Creación ---
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // --- Caso de prueba 2: Lógica de envío (Validación) ---
  it('should NOT call the service if input is empty', async () => {
    // Arrange
    component.userInput.set('   ');

    // Act
    await component.sendMessage();

    // Assert
    expect(iaChatServiceMock.sendPromptToAI).not.toHaveBeenCalled();
    expect(component.isTyping()).toBeFalse();
  });

  // --- Caso de prueba 3: Éxito del servicio (Versión Infalible) ---
  it('should render bot response and products on success', async () => {
    // Arrange
    const mockResponse: GeminiResponse = {
      Response: 'He encontrado estos productos para ti',
      Products: [
        {
          id: 1,
          title: 'Producto Test',
          price: 100,
          image: '',
          category: 'mens-shoes',
          stock: 10,
          discountPercentage: 10,
          finalPrice: 90,
          rating: 5,
        } as unknown as Product,
      ],
    };
    iaChatServiceMock.sendPromptToAI.and.resolveTo(mockResponse);
    component.userInput.set('Quiero una laptop');

    // Act
    await component.sendMessage();

    // Triple sincronización para asegurar el renderizado en Zoneless
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    const debugElement = fixture.debugElement;

    // En lugar de buscar por clase, buscamos TODO el texto del componente
    const componentText = debugElement.nativeElement.textContent;

    // Validamos que los textos existan en cualquier parte del componente renderizado
    expect(componentText)
      .withContext('Debe mostrar la respuesta de la IA')
      .toContain('He encontrado estos productos');
    expect(componentText)
      .withContext('Debe mostrar el nombre del producto')
      .toContain('Producto Test');

    expect(iaChatServiceMock.sendPromptToAI).toHaveBeenCalledWith('Quiero una laptop');
  });
  // --- Caso de prueba 4: Manejo de errores ---
  it('should show error message when service fails', async () => {
    // Arrange
    iaChatServiceMock.sendPromptToAI.and.rejectWith('API Error');
    component.userInput.set('Cualquier cosa');

    // Act
    await component.sendMessage();

    // Sincronización
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    const debugElement = fixture.debugElement;
    const messageElements = debugElement.queryAll(By.css('.bg-white.text-gray-800 p'));
    const lastMessageText = messageElements[messageElements.length - 1].nativeElement.textContent;

    expect(lastMessageText).toContain('hubo un error');
    expect(component.isTyping()).toBeFalse();
  });

  // --- Caso de prueba 5: Interacción UI ---
  it('should call closeIAChat when close button is clicked', () => {
    const closeBtn = fixture.debugElement.query(By.css('button[title="Cerrar chat"]'));
    closeBtn.triggerEventHandler('click', null);
    expect(iaChatServiceMock.closeIAChat).toHaveBeenCalled();
  });

  // --- Caso de prueba 6: Cálculo de Descuentos ---
  it('should calculate finalPrice correctly when a product has a discount', async () => {
    // Arrange: Definimos el objeto con el tipo GeminiResponse
    const mockResponse: GeminiResponse = {
      Response: 'Mira este descuento',
      Products: [
        {
          id: 1,
          title: 'Laptop Pro',
          price: 1000,
          image: '',
          category: 'tech',
          stock: 10,
          discountPercentage: 20,
          rating: 5,
        } as Product,
      ],
    };

    // Ahora resolveTo acepta mockResponse sin necesidad de "any"
    iaChatServiceMock.sendPromptToAI.and.resolveTo(mockResponse);

    // Act
    component.userInput.set('Ofertas');
    await component.sendMessage();
    fixture.detectChanges();

    // Assert
    const messages = component.messages();
    const processedProduct = messages[messages.length - 1].products![0];

    // Verificamos el cálculo que hace el componente internamente
    expect(processedProduct.finalPrice).toBe(800);

    const priceData = fixture.debugElement.query(By.css('data')).nativeElement.textContent;
    expect(priceData).toContain('800');
  });

  // --- Caso de prueba 7: Selección de Producto ---
  it('should set selectedProduct and show confirmation message', () => {
    // Usamos un objeto parcial y lo casteamos a Product para evitar el any
    const mockProduct = {
      id: 1,
      title: 'Teclado',
      price: 50,
      image: '',
      category: 'acc',
      stock: 10,
      rating: 5,
      discountPercentage: 0,
      finalPrice: 50,
    } as Product;

    component.selectProduct(mockProduct);
    fixture.detectChanges();

    expect(component.selectedProduct()).toEqual(mockProduct);
    const messages = component.messages();
    expect(messages[messages.length - 1].text).toContain('Has seleccionado: Teclado');
  });
});
