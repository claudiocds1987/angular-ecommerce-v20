import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";

import { MatDatepickerModule } from "@angular/material/datepicker";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatNativeDateModule } from "@angular/material/core";
import { SkeletonDirective } from "../../directives/skeleton.directive";

@Component({
    selector: "app-date-range",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatButtonModule,
        MatNativeDateModule,
        SkeletonDirective,
    ],

    templateUrl: "./date-range.component.html",
    styleUrls: ["./date-range.component.scss", "../../styles/skeleton.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeComponent {
    @Input() label = "Rango de fechas";
    @Input() appSkeleton = false;
    @Input() dateRangeFormGroup!: FormGroup;
}
