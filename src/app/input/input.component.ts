import { NgClass } from '@angular/common';
import { Component, input, model, OnInit, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatError,
  MatFormField,
  MatFormFieldAppearance,
  MatHint,
  MatLabel,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-input',
  imports: [
    MatFormField,
    NgClass,
    MatLabel,
    ReactiveFormsModule,
    MatHint,
    MatError,
    MatInput,
  ],
  standalone: true,
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent implements OnInit {
  // Input properties
  fieldCtrl = model.required<FormControl | any>();
  type = input<'text' | 'number' | 'datetime-local'>('text');
  appearance = input<MatFormFieldAppearance>('fill');
  label = input<string>();
  placeholder = input<string>('');
  name = input<string>('');
  className = input<string>('');
  hintText = input<string>('');
  readonly = input<boolean>(false);
  maxLength = input<number | null>(null);
  min = input<number | null>(null);
  max = input<number | null>(null);
  step = input<number | null>(null);
  errorList = input<{ error: string; message: string; priority?: number }[]>(
    []
  );
  subscriptSizing = input<'dynamic' | 'fixed'>('fixed');

  inputChange = output<string>();
  inputBlur = output<void>();
  inputKeyUp = output<void>();

  ngOnInit(): void {}

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.inputChange.emit(inputElement.value ?? '');
  }

  onBlur(): void {
    this.inputBlur.emit();
  }

  onKeyUp(): void {
    this.inputKeyUp.emit();
  }

  getErrorMessage(): string | null {
    return null;

    // this.commonUtilService.getErrorMessage(
    //   this.fieldCtrl(),
    //   this.errorList()
    // );
  }
}
