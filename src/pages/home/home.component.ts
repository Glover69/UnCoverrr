import {Component, ElementRef, OnInit, signal, ViewChild} from '@angular/core';
import {InputFieldBaseComponent} from '../../components/input-field-base/input-field-base.component';
import {ButtonComponent} from '../../components/button/button.component';
import {DialogComponent} from '../../components/dialog/dialog.component';
import gsap from 'gsap';

@Component({
  selector: 'app-home',
  imports: [
    InputFieldBaseComponent,
    ButtonComponent,
    DialogComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  @ViewChild('hoursEl', { static: false }) hoursEl!: ElementRef;
  @ViewChild('minutesEl', { static: false }) minutesEl!: ElementRef;
  @ViewChild('secondsEl', { static: false }) secondsEl!: ElementRef;
  @ViewChild('progressEl', { static: false }) progressEl!: ElementRef;

  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';

  private intervalId: any;
  private previousHours: number = 0;
  private previousMinutes: number = 0;
  private previousSeconds: number = 0;

  isDialogOpen: boolean = false;

  ngOnInit(){
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight.getTime() - now.getTime();

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    // Animate if values changed
    if (h !== this.previousHours) {
      this.animateValue(this.hoursEl, h);
      this.previousHours = h;
    }
    if (m !== this.previousMinutes) {
      this.animateValue(this.minutesEl, m);
      this.previousMinutes = m;
    }
    if (s !== this.previousSeconds) {
      this.animateValue(this.secondsEl, s);
      this.previousSeconds = s;
    }

    this.hours = this.padZero(h);
    this.minutes = this.padZero(m);
    this.seconds = this.padZero(s);

    // Update progress bar
    const totalSeconds = 24 * 60 * 60;
    const remainingSeconds = h * 3600 + m * 60 + s;
    const progress = (remainingSeconds / totalSeconds) * 100;

    if (this.progressEl) {
      gsap.to(this.progressEl.nativeElement, {
        width: `${progress}%`,
        duration: 1,
        ease: 'power2.out'
      });
    }
  }


  private animateValue(element: ElementRef, value: number) {
    if (!element) return;

    gsap.fromTo(element.nativeElement,
      {
        scale: 1.2,
        color: '#9466e3'
      },
      {
        scale: 1,
        duration: 0.3,
        ease: 'power2.inOut'
      }
    );
  }


  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
