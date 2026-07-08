import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminRolesApiService } from '../../../core/services/admin/admin-roles-api.service';
import { Permission, Role } from '../../../core/models/admin.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-role-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-role-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminRoleListComponent implements OnInit {
  private readonly api = inject(AdminRolesApiService);
  private readonly toast = inject(ToastService);

  roles = signal<Role[]>([]);
  permissions = signal<Permission[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  name = '';
  description = '';
  selectedPermissionIds = new Set<string>();

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const [rolesRes, permissionsRes] = await Promise.all([
      firstValueFrom(this.api.listRoles()),
      firstValueFrom(this.api.listPermissions()),
    ]);
    this.roles.set(rolesRes.data);
    this.permissions.set(permissionsRes.data);
  }

  togglePermission(id: string): void {
    if (this.selectedPermissionIds.has(id)) this.selectedPermissionIds.delete(id);
    else this.selectedPermissionIds.add(id);
  }

  startCreate(): void {
    this.name = '';
    this.description = '';
    this.selectedPermissionIds = new Set();
    this.editingId.set(null);
    this.showForm.set(true);
  }

  startEdit(role: Role): void {
    this.name = role.name;
    this.description = role.description ?? '';
    this.selectedPermissionIds = new Set(role.permissions.map((p) => p.id));
    this.editingId.set(role.id);
    this.showForm.set(true);
  }

  async save(): Promise<void> {
    const payload = { name: this.name, description: this.description, permissionIds: Array.from(this.selectedPermissionIds) };
    if (this.editingId()) {
      await firstValueFrom(this.api.updateRole(this.editingId()!, payload));
      this.toast.success('Role updated');
    } else {
      await firstValueFrom(this.api.createRole(payload));
      this.toast.success('Role created');
    }
    this.showForm.set(false);
    await this.load();
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Delete this role?')) return;
    await firstValueFrom(this.api.removeRole(id));
    this.toast.success('Role deleted');
    await this.load();
  }
}
