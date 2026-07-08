import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductsApiService } from '../../core/services/products-api.service';
import { CatalogApiService } from '../../core/services/catalog-api.service';
import { Product, Category } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly productsApi = inject(ProductsApiService);
  private readonly catalogApi = inject(CatalogApiService);

  featured = signal<Product[]>([]);
  bestSellers = signal<Product[]>([]);
  newArrivals = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const [featuredRes, bestSellersRes, newArrivalsRes, categoriesRes] = await Promise.all([
        firstValueFrom(this.productsApi.list({ limit: 8, sort: 'newest' })),
        firstValueFrom(this.productsApi.list({ limit: 8, sort: 'bestseller' })),
        firstValueFrom(this.productsApi.list({ limit: 8, sort: 'newest' })),
        firstValueFrom(this.catalogApi.getCategories()),
      ]);
      this.featured.set(featuredRes.data.filter((p) => p.isFeatured).slice(0, 8) || featuredRes.data.slice(0, 8));
      this.bestSellers.set(bestSellersRes.data);
      this.newArrivals.set(newArrivalsRes.data);
      this.categories.set(categoriesRes.data);
    } finally {
      this.loading.set(false);
    }
  }
}
