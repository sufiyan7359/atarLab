import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AdminActivityLogsApiService } from '../../../core/services/admin/admin-activity-logs-api.service';
import { ActivityLog } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-activity-log-list',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-activity-log-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminActivityLogListComponent implements OnInit {
  private readonly api = inject(AdminActivityLogsApiService);
  logs = signal<ActivityLog[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.list());
      this.logs.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }
}
