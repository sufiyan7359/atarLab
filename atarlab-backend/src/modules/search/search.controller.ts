import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SearchService } from './search.service';
import { ProductsService } from '../products/products.service';
import { QueryProductsDto } from '../products/dto/query-products.dto';

@ApiTags('Search')
@Public()
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('suggest')
  suggest(@Query('q') q: string) {
    return this.searchService.suggest(q ?? '');
  }

  @Get()
  search(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }
}
