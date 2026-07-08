import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductsApiService, ProductQuery } from '../../../core/services/products-api.service';
import { CatalogApiService } from '../../../core/services/catalog-api.service';
import { Product, Category, Brand } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productsApi = inject(ProductsApiService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  total = signal(0);
  loading = signal(true);

  query: ProductQuery = { page: 1, limit: 12 };

  async ngOnInit(): Promise<void> {
    const [categoriesRes, brandsRes] = await Promise.all([
      firstValueFrom(this.catalogApi.getCategories()),
      firstValueFrom(this.catalogApi.getBrands()),
    ]);
    this.categories.set(categoriesRes.data);
    this.brands.set(brandsRes.data);

    this.route.queryParamMap.subscribe((params) => {
      this.query = {
        page: 1,
        limit: 12,
        category: params.get('category') ?? undefined,
        brand: params.get('brand') ?? undefined,
        gender: params.get('gender') ?? undefined,
        sort: params.get('sort') ?? undefined,
        q: params.get('q') ?? undefined,
      };
      void this.load();
    });
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.productsApi.list(this.query));
      this.products.set(res.data);
      this.total.set(res.meta?.total ?? res.data.length);
    } finally {
      this.loading.set(false);
    }
  }

  updateFilter(key: keyof ProductQuery, value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
    });
  }

  nextPage(): void {
    this.query.page = (this.query.page ?? 1) + 1;
    void this.load();
  }

  prevPage(): void {
    this.query.page = Math.max(1, (this.query.page ?? 1) - 1);
    void this.load();
  }
}
