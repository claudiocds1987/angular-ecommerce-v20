import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-primary-button',
    standalone: true,
    imports: [],
    templateUrl: './primary-button.html',
    styleUrl: './primary-button.scss',
})
export class PrimaryButton {
    label = input<string>('');
    disabled = input<boolean>(false);
    btnClicked = output<void>();

    onClick() {
        this.btnClicked.emit();
    }
}
