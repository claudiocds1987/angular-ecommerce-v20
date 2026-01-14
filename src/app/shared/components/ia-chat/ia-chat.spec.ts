import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IaChat } from './ia-chat';

describe('IaChat', () => {
    let component: IaChat;
    let fixture: ComponentFixture<IaChat>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IaChat],
        }).compileComponents();

        fixture = TestBed.createComponent(IaChat);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
