import { Component, ElementRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {
  protected readonly title = signal('lunamoon');
  private readonly el = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    this.updateBackgroundVars();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.updateBackgroundVars();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateBackgroundVars();
  }

  private updateBackgroundVars(): void {
    const root = this.el.nativeElement as HTMLElement;
    const doc = document.documentElement;
    const max = Math.max(doc.scrollHeight - doc.clientHeight, 1);
    const p = Math.min(Math.max(window.scrollY / max, 0), 1);

    let img1 = 0, img2 = 0, img3 = 0;
    if (p <= 0.5) {
      const t = p / 0.5; // 0 -> 1
      img1 = 1 - t;
      img2 = t;
      img3 = 0;
    } else {
      const t = (p - 0.5) / 0.5; // 0 -> 1
      img1 = 0;
      img2 = 1 - t;
      img3 = t;
    }

    const angle = 90 + 270 * p; // 90deg -> 360deg as you scroll
    const strength = 0.6 + 0.4 * Math.abs(Math.sin(p * Math.PI));

    root.style.setProperty('--scroll-progress', String(p));
    root.style.setProperty('--img1-opacity', img1.toFixed(3));
    root.style.setProperty('--img2-opacity', img2.toFixed(3));
    root.style.setProperty('--img3-opacity', img3.toFixed(3));
    root.style.setProperty('--gradient-angle', `${angle}deg`);
    root.style.setProperty('--gradient-strength', strength.toFixed(3));
  }
}
