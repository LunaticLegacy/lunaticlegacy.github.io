import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home {
  people_view = 0;
  avatarSrc = '/pictures/猫.jpg';
}
