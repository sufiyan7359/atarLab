import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { OffersService } from './offers.service';

@ApiTags('Offers')
@Public()
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findActive() {
    return this.offersService.findActive();
  }
}
