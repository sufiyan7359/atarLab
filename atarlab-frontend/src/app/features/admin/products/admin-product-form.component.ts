import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AdminNotePayload,
  AdminProductPayload,
  AdminProductsApiService,
  AdminVariantPayload,
} from '../../../core/services/admin/admin-products-api.service';
import { AdminCategoriesApiService } from '../../../core/services/admin/admin-categories-api.service';
import { AdminBrandsApiService } from '../../../core/services/admin/admin-brands-api.service';
import { UploadsApiService } from '../../../core/services/admin/uploads-api.service';
import { Category, Brand } from '../../../core/models/product.model';
import { ToastService } from '../../../shared/services/toast.service';

interface ImageRow {
  url: string;
  altText: string;
}

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss',
})
export class AdminProductFormComponent implements OnInit {
  private readonly productsApi = inject(AdminProductsApiService);
  private readonly categoriesApi = inject(AdminCategoriesApiService);
  private readonly brandsApi = inject(AdminBrandsApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  productId = signal<string | null>(null);
  saving = signal(false);
  uploading = signal(false);

  form = this.emptyForm();
  seasonText = '';
  occasionText = '';
  variants: AdminVariantPayload[] = [{ sku: '', sizeMl: 50, price: 0 }];
  fragranceNotes: AdminNotePayload[] = [];
  ingredients: string[] = [];
  images: ImageRow[] = [];

  async ngOnInit(): Promise<void> {
    const [categoriesRes, brandsRes] = await Promise.all([
      firstValueFrom(this.categoriesApi.list()),
      firstValueFrom(this.brandsApi.list()),
    ]);
    this.categories.set(categoriesRes.data);
    this.brands.set(brandsRes.data);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const res = await firstValueFrom(this.productsApi.getById(id));
      const p = res.data;
      this.form = {
        name: p.name,
        slug: p.slug,
        brandId: p.brand?.id,
        categoryId: p.category?.id,
        shortDescription: p.shortDescription ?? '',
        description: p.description ?? '',
        gender: p.gender,
        concentration: p.concentration ?? undefined,
        longevity: p.longevity ?? '',
        projection: p.projection ?? '',
        basePrice: Number(p.basePrice),
        isActive: true,
        isFeatured: p.isFeatured,
        variants: [],
      };
      this.seasonText = (p.season ?? []).join(', ');
      this.occasionText = (p.occasion ?? []).join(', ');
      this.variants = p.variants.map((v) => ({
        sku: v.sku,
        sizeMl: v.sizeMl,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        stockQuantity: v.stockQuantity,
      }));
      this.fragranceNotes = (p.fragranceNotes ?? []).map((n) => ({ noteType: n.noteType, name: n.name }));
      this.ingredients = (p.ingredients ?? []).map((i) => i.name);
      this.images = (p.images ?? []).map((i) => ({ url: i.url, altText: i.altText ?? '' }));
      // Written last and after all the plain (non-signal) fields above are populated: under
      // OnPush this signal write is what schedules the re-render, and by the time it fires,
      // the plain property mutations are already in place to be picked up in the same pass.
      this.productId.set(id);
    }
  }

  addVariant(): void {
    this.variants = [...this.variants, { sku: '', sizeMl: 50, price: 0 }];
  }
  removeVariant(index: number): void {
    this.variants = this.variants.filter((_, i) => i !== index);
  }

  addNote(): void {
    this.fragranceNotes = [...this.fragranceNotes, { noteType: 'TOP', name: '' }];
  }
  removeNote(index: number): void {
    this.fragranceNotes = this.fragranceNotes.filter((_, i) => i !== index);
  }

  addIngredient(): void {
    this.ingredients = [...this.ingredients, ''];
  }
  removeIngredient(index: number): void {
    this.ingredients = this.ingredients.filter((_, i) => i !== index);
  }

  removeImage(index: number): void {
    this.images = this.images.filter((_, i) => i !== index);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const res = await firstValueFrom(this.uploadsApi.uploadImage(file));
      this.images = [...this.images, { url: res.data.url, altText: this.form.name }];
      this.toast.success('Image uploaded');
    } catch {
      this.toast.error('Image upload failed');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const payload: AdminProductPayload = {
        ...this.form,
        season: this.seasonText
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean),
        occasion: this.occasionText
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean),
        variants: this.variants.filter((v) => v.sku && v.price >= 0),
        fragranceNotes: this.fragranceNotes.filter((n) => n.name),
        ingredients: this.ingredients.filter((i) => i.trim()),
        images: this.images.filter((i) => i.url),
      };

      if (this.productId()) {
        await firstValueFrom(this.productsApi.update(this.productId()!, payload));
        this.toast.success('Product updated');
      } else {
        await firstValueFrom(this.productsApi.create(payload));
        this.toast.success('Product created');
      }
      this.router.navigate(['/admin/products']);
    } catch {
      this.toast.error('Could not save product — check required fields');
    } finally {
      this.saving.set(false);
    }
  }

  private emptyForm(): AdminProductPayload {
    return {
      name: '',
      slug: '',
      basePrice: 0,
      gender: 'UNISEX',
      isActive: true,
      isFeatured: false,
      variants: [],
    };
  }
}
