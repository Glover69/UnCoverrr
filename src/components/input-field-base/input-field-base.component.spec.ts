import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFieldBaseComponent } from './input-field-base.component';

describe('InputFieldBaseComponent', () => {
  let component: InputFieldBaseComponent;
  let fixture: ComponentFixture<InputFieldBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputFieldBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputFieldBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
