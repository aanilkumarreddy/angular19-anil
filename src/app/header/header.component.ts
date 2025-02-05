import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatToolbar,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent {
  protected readonly fillerNav = Array.from(
    { length: 50 },
    (_, i) => `Nav Item ${i + 1}`
  );

  constructor() {}
}
