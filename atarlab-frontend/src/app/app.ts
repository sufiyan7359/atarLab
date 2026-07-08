import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/layout/header/header.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { MobileNavComponent } from './shared/layout/mobile-nav/mobile-nav.component';
import { ToastHostComponent } from './shared/components/toast-host/toast-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, MobileNavComponent, ToastHostComponent],
  template: `
    <app-header />
    <main class="page-shell">
      <router-outlet />
    </main>
    <app-footer />
    <app-mobile-nav />
    <app-toast-host />
  `,
  styles: [
    `
      .page-shell {
        min-height: 60vh;
        padding-bottom: 72px;
      }
      @media (min-width: 900px) {
        .page-shell {
          padding-bottom: 0;
        }
      }
    `,
  ],
})
export class App {}
