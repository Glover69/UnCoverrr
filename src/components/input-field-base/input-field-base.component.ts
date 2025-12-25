import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-input-field-base',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-field-base.component.html',
  styleUrl: './input-field-base.component.css'
})
export class InputFieldBaseComponent {
  @Input() inputType: 'base' | 'textarea' = 'base'
  @Input() label: string = ''
  @Input() placeholder: string = ''
  @Input() baseInputType!: 'default' | 'leading-dropdown' | 'trailing-dropdown' | 'leading-text';
  // @Input() icon: string = ''
  @Input() iconName: string | null = ''
  @Input() iconStyle?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone' | null = 'regular'
  @Input() isDestructive: boolean = false
  @Input() hintText: string = ''
  @Input() leadingOptions?: Array<{ label: string; value: string }>;
  @Input() trailingOptions?: Array<{ label: string; value: string }>;
  @Input() leadingTextValue: string = ''
  @Input() disabled: boolean = false

  value: string = '';

  onChange = (item: any) => {};
  onTouched = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(item : any): void {
    this.onChange = item;
  }

  registerOnTouched(item: any): void {
    this.onTouched = item;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
