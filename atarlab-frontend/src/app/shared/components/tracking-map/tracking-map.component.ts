import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, effect, input, viewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-tracking-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #mapEl class="tracking-map"></div>`,
  styles: [
    `
      .tracking-map {
        width: 100%;
        height: 280px;
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      :host ::ng-deep .agent-marker {
        font-size: 1.4rem;
        text-align: center;
        line-height: 28px;
        filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.4));
      }
      :host ::ng-deep .destination-marker {
        font-size: 1.2rem;
        text-align: center;
        line-height: 24px;
      }
    `,
  ],
})
export class TrackingMapComponent implements AfterViewInit {
  lat = input.required<number>();
  lng = input.required<number>();
  destinationLat = input<number | null>(null);
  destinationLng = input<number | null>(null);

  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private map: L.Map | null = null;
  private agentMarker: L.Marker | null = null;

  constructor() {
    effect(() => {
      const lat = this.lat();
      const lng = this.lng();
      if (this.map && this.agentMarker) {
        this.agentMarker.setLatLng([lat, lng]);
        this.map.panTo([lat, lng], { animate: true });
      }
    });
  }

  ngAfterViewInit(): void {
    const lat = this.lat();
    const lng = this.lng();

    this.map = L.map(this.mapEl().nativeElement, { zoomControl: false, attributionControl: false }).setView(
      [lat, lng],
      14,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

    this.agentMarker = L.marker([lat, lng], {
      icon: L.divIcon({ className: 'agent-marker', html: '🛵', iconSize: [28, 28] }),
    }).addTo(this.map);

    const destLat = this.destinationLat();
    const destLng = this.destinationLng();
    if (destLat != null && destLng != null) {
      L.marker([destLat, destLng], {
        icon: L.divIcon({ className: 'destination-marker', html: '🏠', iconSize: [24, 24] }),
      }).addTo(this.map);
      this.map.fitBounds([
        [lat, lng],
        [destLat, destLng],
      ], { padding: [30, 30] });
    }
  }
}
