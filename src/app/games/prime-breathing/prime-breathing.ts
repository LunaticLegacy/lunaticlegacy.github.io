import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-prime-breathing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './prime-breathing.html',
  styleUrl: './prime-breathing.css'
})

export class PrimeBreathing implements OnDestroy, OnInit {
  count = 0;                  // 当前数到几。
  isHolding = false;          // 是否按住空格。
  lives = 3;                  // 还有几条命。
  running = false;            // 是否在开始游戏。
  lastWasCorrect = true;      // 上个逻辑是否正确。

  hardMode = false;           // 是否启动困难模式 - 在困难模式下，不会显示Hold或Release的提示。

  // 语言文本。
  lang: 'en' | 'zh' = 'en';
  private readonly translations: Record<string, Record<'en' | 'zh', string>> = {
    back: { en: '← Back', zh: '← 返回' },
    title: { en: 'Prime Breathing', zh: '质数呼吸' },
    ruleLabel: { en: 'Rule:', zh: '规则：' },
    ruleText: { en: 'Hold Space while numbers are not prime. Release on primes.', zh: '在合数（非质数）时按住空格，遇到质数时松开。' },
    ruleText2: { en: '(Prime number is an integer that cannot be divided by any integer other than 1 and itself.)', zh: '（质数是只能被1和自身整除的正整数。）' },
    controlHint: { en: 'Press and hold Space for composites, let go on primes.', zh: '合数按住空格，质数松开。' },
    controlHintMobile: { en: 'Press the Lower Button or Hold Spacebar to Play', zh: '点击下方按钮或按住空格游玩' },
    hardModeToggle: { en: 'Enable Hard Mode (No Indication)', zh: '启用困难模式（无提示）' },
    hold: { en: 'Hold', zh: '按住' },
    release: { en: 'Release', zh: '松开' },
    hardModeBadge: { en: 'HARD MODE', zh: '困难模式' },
    startBtn: { en: 'Press or Hold Spacebar to Start', zh: '按下或按住空格开始' },
    playAgainBtn: { en: 'Press or Hold Spacebar to Play Again', zh: '按下或按住空格再玩一次' },
    gameOverTitle: { en: 'Game Over', zh: '游戏结束' },
    gameOverText: { en: 'You lost all hearts. Try again!', zh: '生命耗尽，再试一次！' },
    lives: { en: 'Lives', zh: '生命' },
    language: { en: 'Language', zh: '语言' },
    english: { en: 'English', zh: '英语' },
    chinese: { en: '中文', zh: '中文' },
    playAgainMobile: { en: 'Press the Lower Button or Hold Spacebar to Play Again', zh: '点击下方按钮或按住空格再玩一次' }
  };

  // 私有属性。
  private timerId: any = null;     // 一个用于储存时间的东西。
  private tickMs = 1000 / 60;      // 游戏刻周期（毫秒）。
  private ticker = 1;              // 当前游戏刻。

  private reactionTick = 20;       // 反应刻。
  private inputTimer: any = null;  // 储存输入时间相关函数的内容。
  private lifeLost = false;        // 在这个数字是否已扣过血。

  get isPrimeNow(): boolean {     // getter：是否为质数。（别名）
    return this.isPrime(this.count);
  }

  t(key: keyof typeof this.translations): string {
    return this.translations[key][this.lang];
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
    if (e.code === 'Space' || e.key === ' ') {
      if (!this.running) {
        this.start();
      }
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

  onLanguageChange(value: 'en' | 'zh'): void {
    this.lang = value;
    try {
      localStorage.setItem('prime-breathing-lang', value);
    } catch {}
  }

  // 触摸/指针：开始（用于移动端/触屏）。
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

  ngOnInit(): void {
    try {
      const saved = localStorage.getItem('prime-breathing-lang');
      if (saved === 'en' || saved === 'zh') {
        this.lang = saved as 'en' | 'zh';
      }
    } catch {}
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
