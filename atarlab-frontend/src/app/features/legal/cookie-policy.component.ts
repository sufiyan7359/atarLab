import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cookie-policy.component.html',
  styleUrl: './legal-page.scss',
})
export class CookiePolicyComponent {}
