import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-prime-breathing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prime-breathing.html',
  styleUrl: './prime-breathing.css'
})
export class PrimeBreathing implements OnDestroy {
  count = 0;
  isHolding = false;
  lives = 3;
  running = false;
  lastWasCorrect = true;
  private timerId: any = null;
  private tickMs = 1200;

  // Reaction delay configuration (grace period)
  private reactionMs = 300;
  private inputTimer: any = null;
  private lastInputAt = 0;
  private lastTickAt = 0;

  get isPrimeNow(): boolean {
    return this.isPrime(this.count);
  }

  get shouldHold(): boolean {
    return !this.isPrimeNow; // Hold on non-primes (including 0 and 1), release on primes
  }

  start(): void {
    this.reset();
    this.running = true;
    this.lastWasCorrect = false;
    this.timerId = setInterval(() => {
      this.count += 1;
      this.lastTickAt = Date.now();
      this.evaluate();
    }, this.tickMs);
  }

  reset(): void {
    this.stop();
    this.count = 0;
    this.isHolding = false;
    this.lives = 3;
    this.lastWasCorrect = true;
    this.lastInputAt = 0;
    this.lastTickAt = 0;
  }

  stop(): void {
    this.running = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.inputTimer) {
      clearTimeout(this.inputTimer);
      this.inputTimer = null;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (!this.running) return;
    if (e.code === 'Space' || e.key === ' ') {
      this.scheduleHoldChange(true);
      e.preventDefault();
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (!this.running) return;
    if (e.code === 'Space' || e.key === ' ') {
      this.scheduleHoldChange(false);
      e.preventDefault();
    }
  }

  private scheduleHoldChange(target: boolean): void {
    if (this.inputTimer) {
      clearTimeout(this.inputTimer);
      this.inputTimer = null;
    }
    this.inputTimer = setTimeout(() => {
      this.isHolding = target;
      this.lastInputAt = Date.now();
      this.evaluate();
      this.inputTimer = null;
    }, this.reactionMs);
  }

  private evaluate(): void {
    const correct = this.isHolding === this.shouldHold;
    const now = Date.now();
    const withinInputGrace = now - this.lastInputAt < this.reactionMs;
    const withinTickGrace = now - this.lastTickAt < this.reactionMs;
    const allowPenalty = !withinInputGrace && !withinTickGrace;

    if (allowPenalty) {
      if (!correct && this.lastWasCorrect) {
        this.loseLife();
      }
      this.lastWasCorrect = correct;
    }
  }

  private loseLife(): void {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.stop();
  }

  private isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
