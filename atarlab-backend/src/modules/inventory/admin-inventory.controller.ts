import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/interfaces/auth.interface';

@ApiTags('Admin: Inventory')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF)
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('lowStockOnly') lowStockOnly?: string,
  ) {
    return this.inventoryService.findAll(pagination, lowStockOnly === 'true');
  }

  @Get(':variantId/movements')
  getMovements(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.inventoryService.getMovements(variantId, pagination);
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustInventoryDto, @CurrentUser() user: RequestUser) {
    return this.inventoryService.adjust(dto, user.id);
  }
}
