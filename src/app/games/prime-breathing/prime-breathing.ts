import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-prime-breathing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './prime-breathing.html',
  styleUrl: './prime-breathing.css'
})

export class PrimeBreathing implements OnDestroy {
  count = 0;                  // 当前数到几。
  isHolding = false;          // 是否按住空格。
  lives = 3;                  // 还有几条命。
  running = false;            // 是否在开始游戏。
  lastWasCorrect = true;      // 上个逻辑是否正确。

  hardMode = false;           // 是否启动困难模式 - 在困难模式下，不会显示Hold或Release的提示。

  // 私有属性。
  private timerId: any = null;     // 一个用于储存时间的东西。
  private tickMs = 1000 / 60;      // 游戏刻周期（毫秒）。
  private ticker = 1;              // 当前游戏刻。

  private reactionTick = 20;       // 反应刻。
  private inputTimer: any = null;  // 储存输入时间相关的内容。
  private lifeLost = false;        // 在这个数字是否已扣过血。

  get isPrimeNow(): boolean {     // getter：是否为质数。（别名）
    return this.isPrime(this.count);
  }

  get shouldHold(): boolean {     // getter：是否该按了。（别名）
    return !this.isPrimeNow; // Hold on non-primes (including 0 and 1), release on primes
  }

  // 被绑定到开始游戏按钮的方法。
  start(): void {
    this.reset();
    this.running = true;
    this.lastWasCorrect = false;

    // 绑定setInterval方法，每1个tick执行一次。（不过这里我打算每秒执行60个tick，且玩家有大概10tick的反应时间）
    this.timerId = setInterval(() => {
      // 这里处理每一帧分别如何进行。
      this.tick();
    }, this.tickMs);
  }

  // 重置游戏的方法，每次结束后需手动重置。
  reset(): void {
    this.count = 0;
    this.isHolding = false;
    this.lives = 3;
    this.lastWasCorrect = true;
  }

  // 结束游戏。
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

  // 监听按下键。
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (!this.running) {
      this.start();
    }
    if (e.code === 'Space' || e.key === ' ') {
      this.toggleHold(true);
      e.preventDefault();
    }
  }

  // 监听抬起键。
  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (!this.running) return;
    if (e.code === 'Space' || e.key === ' ') {
      this.toggleHold(false);
      e.preventDefault();
    }
  }

  // 触摸/指针：按下（用于移动端/触屏）。
  onPressStart(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (!this.running) {
      this.start();
    }
    this.toggleHold(true);
  }

  // 触摸/指针：抬起/取消。
  onPressEnd(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.toggleHold(false);
  }

  // 游戏主逻辑在这里。
  private tick(): void {
    this.ticker += 1;
    // 将死亡判定挪动到tick内，防止一些奇怪的情况发生。
    if (this.lives <= 0) {
      this.gameOver();
    }

    // 更新计时器，每60个tick执行一次。
    if (this.ticker % 60 == 0) {
      this.sec();
    }

    if (this.ticker % 60 >= this.reactionTick) {
      // 如果超时且按下状态错误，则扣除生命值。
      if (this.isHolding != this.shouldHold) {
        this.loseLife();
      }
    }
  }

  // 在tick函数中执行的，被安排到每秒钟执行一次的数据，在这里。
  private sec(): void {
    this.count += 1;                  // 更新当前数字。
    this.lifeLost = false;            // 更新是否扣血——本轮内并未扣过血。
  }

  // 更新是否在按下当前状态。
  private toggleHold(target: boolean): void {
    this.isHolding = target;
  }

  // 扣血。该函数在每秒内只会扣一次血。
  private loseLife(): void {
    if (this.lifeLost != true) {
      this.lives -= 1;
      this.lifeLost = true;
    }
  }

  private gameOver(): void {
    this.stop();
  }

  private isPrime(n: number): boolean {
    // 判断质数？
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
