import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RevenuePoint } from '../../../core/models/admin.model';

interface Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: number;
}

const CHART_HEIGHT = 220;
const CHART_WIDTH = 720;
const MARGIN = { top: 16, right: 8, bottom: 28, left: 8 };
const MAX_BAR_WIDTH = 24;

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="viz-root">
      @if (points().length === 0) {
        <p class="empty">No revenue in this period yet.</p>
      } @else {
        <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" [attr.width]="'100%'" [attr.height]="height">
          <!-- gridlines -->
          @for (tick of yTicks(); track tick) {
            <line
              class="gridline"
              [attr.x1]="MARGIN.left"
              [attr.x2]="width - MARGIN.right"
              [attr.y1]="yScale(tick)"
              [attr.y2]="yScale(tick)"
            />
            <text class="axis-label" [attr.x]="MARGIN.left" [attr.y]="yScale(tick) - 4">{{ formatCompact(tick) }}</text>
          }
          <!-- baseline -->
          <line
            class="baseline"
            [attr.x1]="MARGIN.left"
            [attr.x2]="width - MARGIN.right"
            [attr.y1]="height - MARGIN.bottom"
            [attr.y2]="height - MARGIN.bottom"
          />
          <!-- bars -->
          @for (bar of bars(); track bar.label) {
            <rect
              class="bar"
              [class.hovered]="hoveredLabel() === bar.label"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.width"
              [attr.height]="bar.height"
              rx="4"
              (mouseenter)="hoveredLabel.set(bar.label)"
              (mouseleave)="hoveredLabel.set(null)"
            />
            <text class="x-label" [attr.x]="bar.x + bar.width / 2" [attr.y]="height - MARGIN.bottom + 16">
              {{ bar.label }}
            </text>
          }
        </svg>
        @if (hoveredBar(); as hb) {
          <div class="tooltip" [style.left.px]="hb.x + hb.width / 2" [style.top.px]="hb.y">
            <strong>{{ hb.label }}</strong>
            <span>{{ formatCurrency(hb.value) }}</span>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .viz-root {
        position: relative;
        --surface-1: var(--bg-elevated);
        --text-secondary: var(--text-secondary);
        --series-1: var(--accent);
      }
      svg {
        display: block;
        overflow: visible;
      }
      .gridline {
        stroke: var(--border);
        stroke-width: 1;
      }
      .baseline {
        stroke: var(--border);
        stroke-width: 1;
      }
      .axis-label,
      .x-label {
        font-size: 10px;
        fill: var(--text-secondary);
      }
      .x-label {
        text-anchor: middle;
      }
      .bar {
        fill: var(--series-1);
        transition: opacity 0.15s ease;
        cursor: pointer;
      }
      .bar.hovered {
        opacity: 0.8;
      }
      .tooltip {
        position: absolute;
        transform: translate(-50%, -110%);
        background: var(--text-primary);
        color: var(--bg);
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
        pointer-events: none;
        white-space: nowrap;
        z-index: 5;
      }
      .empty {
        text-align: center;
        color: var(--text-secondary);
        padding: var(--space-8) 0;
      }
    `,
  ],
})
export class RevenueChartComponent {
  points = input<RevenuePoint[]>([]);

  readonly width = CHART_WIDTH;
  readonly height = CHART_HEIGHT;
  readonly MARGIN = MARGIN;

  hoveredLabel = signal<string | null>(null);

  private readonly maxValue = computed(() => {
    const max = Math.max(0, ...this.points().map((p) => p.revenue));
    return this.niceMax(max);
  });

  yTicks = computed(() => {
    const max = this.maxValue();
    if (max === 0) return [0];
    const step = max / 4;
    return [0, step, step * 2, step * 3, step * 4];
  });

  bars = computed<Bar[]>(() => {
    const data = this.points();
    if (data.length === 0) return [];
    const plotWidth = this.width - MARGIN.left - MARGIN.right;
    const band = plotWidth / data.length;
    const barWidth = Math.min(MAX_BAR_WIDTH, band * 0.6);
    const max = this.maxValue();
    const plotHeight = this.height - MARGIN.top - MARGIN.bottom;

    return data.map((point, i) => {
      const barHeight = max === 0 ? 0 : (point.revenue / max) * plotHeight;
      return {
        x: MARGIN.left + i * band + (band - barWidth) / 2,
        y: this.height - MARGIN.bottom - barHeight,
        width: barWidth,
        height: barHeight,
        label: this.formatDate(point.bucket),
        value: point.revenue,
      };
    });
  });

  hoveredBar = computed(() => this.bars().find((b) => b.label === this.hoveredLabel()) ?? null);

  yScale(value: number): number {
    const max = this.maxValue();
    const plotHeight = this.height - MARGIN.top - MARGIN.bottom;
    if (max === 0) return this.height - MARGIN.bottom;
    return this.height - MARGIN.bottom - (value / max) * plotHeight;
  }

  formatDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  formatCompact(value: number): string {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${Math.round(value)}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      value,
    );
  }

  private niceMax(value: number): number {
    if (value === 0) return 0;
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const residual = value / magnitude;
    const niceResidual = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
    return niceResidual * magnitude;
  }
}
