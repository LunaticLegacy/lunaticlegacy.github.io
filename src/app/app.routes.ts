import { Routes } from '@angular/router';
import { Home } from './home/home';
import { PrimeBreathing } from './games/prime-breathing/prime-breathing';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'prime-breathing', component: PrimeBreathing },
  { path: '**', redirectTo: '' }
];
