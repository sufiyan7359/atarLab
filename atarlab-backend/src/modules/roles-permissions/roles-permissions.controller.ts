import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';
import { RolesPermissionsService } from './roles-permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Admin: Roles & Permissions')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
@Controller('admin')
export class RolesPermissionsController {
  constructor(private readonly service: RolesPermissionsService) {}

  @Get('roles')
  findAllRoles() {
    return this.service.findAllRoles();
  }

  @Get('permissions')
  findAllPermissions() {
    return this.service.findAllPermissions();
  }

  @Get('roles/:id')
  findRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findRoleById(id);
  }

  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) {
    return this.service.createRole(dto);
  }

  @Patch('roles/:id')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.service.updateRole(id, dto);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteRole(id);
  }
}
