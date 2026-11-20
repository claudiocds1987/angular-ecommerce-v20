import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { SkeletonDirective } from '@shared/directives/skeleton.directive';

@Component({
  selector: 'app-tags-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    SkeletonDirective,
  ],
  templateUrl: './tags-tab.html',
  styleUrls: ['./tags-tab.scss', '../../../../../../shared/styles/skeleton.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsTab {
  tags = input.required<string[]>();
  isLoading = input<boolean>(false);

  tagAdded = output<string>();
  tagRemoved = output<number>();

  onAddTag(input: HTMLInputElement): void {
    const rawValue = input.value.trim();
    if (!rawValue) return;
    this.tagAdded.emit(rawValue);
    input.value = '';
  }

  onRemoveTag(index: number): void {
    this.tagRemoved.emit(index);
  }
}
