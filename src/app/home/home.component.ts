import { Component } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'app-home',
  imports: [InputComponent, ReactiveFormsModule, SelectComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
})
export class HomeComponent {
  modelForm = new FormGroup({
    inputControl: new FormControl(''),
    selectControl: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  });

  dropdownOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
    { label: 'Option 4', value: '4' },
    { label: 'Option 5', value: '5' },
  ];
}
