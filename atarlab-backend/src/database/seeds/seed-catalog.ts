import { DataSource } from 'typeorm';
import { Category } from '../../modules/categories/entities/category.entity';
import { Brand } from '../../modules/brands/entities/brand.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductVariant } from '../../modules/products/entities/product-variant.entity';
import { ProductImage } from '../../modules/products/entities/product-image.entity';
import { FragranceNote } from '../../modules/products/entities/fragrance-note.entity';
import { ProductIngredient } from '../../modules/products/entities/product-ingredient.entity';
import { Gender, Concentration, NoteType } from '../../common/enums';

const CATEGORIES = [
  { name: 'Pure Attars', slug: 'pure-attars', image: 'https://picsum.photos/seed/attars/600/400' },
  { name: 'Eau de Parfum', slug: 'eau-de-parfum', image: 'https://picsum.photos/seed/edp/600/400' },
  { name: 'Eau de Toilette', slug: 'eau-de-toilette', image: 'https://picsum.photos/seed/edt/600/400' },
  { name: 'Oud Collection', slug: 'oud-collection', image: 'https://picsum.photos/seed/oud/600/400' },
  { name: 'Body Mists', slug: 'body-mists', image: 'https://picsum.photos/seed/mists/600/400' },
];

const BRANDS = [
  { name: 'AtarLab Reserve', slug: 'atarlab-reserve' },
  { name: 'Noor Al Sharq', slug: 'noor-al-sharq' },
  { name: 'Velvet Amber Co.', slug: 'velvet-amber-co' },
  { name: 'Zahra Oud House', slug: 'zahra-oud-house' },
  { name: 'Bagh-e-Firdaus', slug: 'bagh-e-firdaus' },
];

interface ProductSeed {
  name: string;
  categorySlug: string;
  brandSlug: string;
  gender: Gender;
  concentration: Concentration;
  longevity: string;
  projection: string;
  season: string[];
  occasion: string[];
  basePrice: number;
  notes: { top: string[]; middle: string[]; base: string[] };
  ingredients: string[];
  variants: Array<{ sizeMl: number; price: number; stock: number }>;
}

const PRODUCTS: ProductSeed[] = [
  { name: 'Royal Oud Musk', categorySlug: 'pure-attars', brandSlug: 'zahra-oud-house', gender: Gender.UNISEX, concentration: Concentration.ATTAR, longevity: 'VERY_LONG', projection: 'STRONG', season: ['WINTER', 'AUTUMN'], occasion: ['WEDDING', 'PARTY'], basePrice: 2499, notes: { top: ['Saffron', 'Bergamot'], middle: ['Rose', 'Oud'], base: ['Musk', 'Amber'] }, ingredients: ['Agarwood Oil', 'White Musk', 'Saffron Extract'], variants: [{ sizeMl: 6, price: 999, stock: 40 }, { sizeMl: 12, price: 1799, stock: 30 }] },
  { name: 'Saffron Rose Attar', categorySlug: 'pure-attars', brandSlug: 'noor-al-sharq', gender: Gender.FEMALE, concentration: Concentration.ATTAR, longevity: 'LONG', projection: 'MODERATE', season: ['WINTER', 'SPRING'], occasion: ['DAILY', 'OFFICE'], basePrice: 1899, notes: { top: ['Saffron'], middle: ['Damask Rose'], base: ['Sandalwood'] }, ingredients: ['Rose Absolute', 'Sandalwood Oil', 'Saffron'], variants: [{ sizeMl: 6, price: 799, stock: 50 }, { sizeMl: 12, price: 1399, stock: 35 }] },
  { name: 'Musk Al Malik', categorySlug: 'pure-attars', brandSlug: 'bagh-e-firdaus', gender: Gender.MALE, concentration: Concentration.ATTAR, longevity: 'VERY_LONG', projection: 'STRONG', season: ['WINTER'], occasion: ['WEDDING', 'DAILY'], basePrice: 2199, notes: { top: ['Cardamom'], middle: ['White Musk'], base: ['Ambergris'] }, ingredients: ['White Musk', 'Ambergris Extract'], variants: [{ sizeMl: 6, price: 899, stock: 45 }, { sizeMl: 12, price: 1599, stock: 25 }] },
  { name: 'Jasmine Night Attar', categorySlug: 'pure-attars', brandSlug: 'atarlab-reserve', gender: Gender.FEMALE, concentration: Concentration.ATTAR, longevity: 'LONG', projection: 'MODERATE', season: ['SUMMER', 'SPRING'], occasion: ['PARTY', 'DAILY'], basePrice: 1699, notes: { top: ['Jasmine'], middle: ['Ylang Ylang'], base: ['Musk'] }, ingredients: ['Jasmine Absolute', 'Ylang Ylang Oil'], variants: [{ sizeMl: 6, price: 699, stock: 60 }, { sizeMl: 12, price: 1249, stock: 40 }] },
  { name: 'Amber Kesar Attar', categorySlug: 'pure-attars', brandSlug: 'velvet-amber-co', gender: Gender.UNISEX, concentration: Concentration.ATTAR, longevity: 'LONG', projection: 'MODERATE', season: ['AUTUMN', 'WINTER'], occasion: ['OFFICE', 'DAILY'], basePrice: 1599, notes: { top: ['Kesar (Saffron)'], middle: ['Amber'], base: ['Vanilla'] }, ingredients: ['Amber Resin', 'Saffron', 'Vanilla Extract'], variants: [{ sizeMl: 6, price: 649, stock: 55 }, { sizeMl: 12, price: 1149, stock: 30 }] },
  { name: 'Velvet Oud Parfum', categorySlug: 'eau-de-parfum', brandSlug: 'velvet-amber-co', gender: Gender.UNISEX, concentration: Concentration.EDP, longevity: 'LONG', projection: 'STRONG', season: ['WINTER', 'AUTUMN'], occasion: ['PARTY', 'WEDDING'], basePrice: 3499, notes: { top: ['Pink Pepper', 'Bergamot'], middle: ['Rose', 'Oud'], base: ['Vanilla', 'Musk'] }, ingredients: ['Oud Extract', 'Rose Water', 'Vanilla Bean'], variants: [{ sizeMl: 30, price: 2499, stock: 30 }, { sizeMl: 50, price: 3499, stock: 20 }, { sizeMl: 100, price: 5499, stock: 12 }] },
  { name: 'Golden Amber EDP', categorySlug: 'eau-de-parfum', brandSlug: 'atarlab-reserve', gender: Gender.UNISEX, concentration: Concentration.EDP, longevity: 'LONG', projection: 'STRONG', season: ['AUTUMN', 'WINTER'], occasion: ['OFFICE', 'PARTY'], basePrice: 2999, notes: { top: ['Cinnamon'], middle: ['Amber'], base: ['Sandalwood', 'Musk'] }, ingredients: ['Amber Resin', 'Sandalwood Oil', 'Cinnamon Bark'], variants: [{ sizeMl: 30, price: 2199, stock: 28 }, { sizeMl: 50, price: 2999, stock: 22 }] },
  { name: 'White Musk Femme', categorySlug: 'eau-de-parfum', brandSlug: 'noor-al-sharq', gender: Gender.FEMALE, concentration: Concentration.EDP, longevity: 'MODERATE', projection: 'MODERATE', season: ['SPRING', 'SUMMER'], occasion: ['DAILY', 'OFFICE'], basePrice: 2799, notes: { top: ['Lychee', 'Bergamot'], middle: ['Peony', 'White Musk'], base: ['Cedarwood'] }, ingredients: ['White Musk', 'Peony Extract'], variants: [{ sizeMl: 30, price: 1999, stock: 34 }, { sizeMl: 50, price: 2799, stock: 26 }] },
  { name: 'Noir Homme Intense', categorySlug: 'eau-de-parfum', brandSlug: 'bagh-e-firdaus', gender: Gender.MALE, concentration: Concentration.EDP, longevity: 'VERY_LONG', projection: 'STRONG', season: ['WINTER'], occasion: ['PARTY', 'WEDDING'], basePrice: 3299, notes: { top: ['Black Pepper'], middle: ['Leather', 'Tobacco'], base: ['Oud', 'Vetiver'] }, ingredients: ['Leather Accord', 'Tobacco Leaf', 'Oud Extract'], variants: [{ sizeMl: 30, price: 2399, stock: 24 }, { sizeMl: 100, price: 5299, stock: 10 }] },
  { name: 'Rose Petal Elixir', categorySlug: 'eau-de-parfum', brandSlug: 'zahra-oud-house', gender: Gender.FEMALE, concentration: Concentration.EDP, longevity: 'LONG', projection: 'MODERATE', season: ['SPRING'], occasion: ['DAILY', 'PARTY'], basePrice: 2599, notes: { top: ['Litchi'], middle: ['Turkish Rose'], base: ['Musk', 'Amber'] }, ingredients: ['Turkish Rose Oil', 'White Musk'], variants: [{ sizeMl: 30, price: 1899, stock: 32 }, { sizeMl: 50, price: 2599, stock: 20 }] },
  { name: 'Citrus Breeze EDT', categorySlug: 'eau-de-toilette', brandSlug: 'atarlab-reserve', gender: Gender.MALE, concentration: Concentration.EDT, longevity: 'MODERATE', projection: 'MODERATE', season: ['SUMMER'], occasion: ['DAILY', 'OFFICE'], basePrice: 1799, notes: { top: ['Lemon', 'Grapefruit'], middle: ['Neroli'], base: ['Cedarwood'] }, ingredients: ['Lemon Oil', 'Neroli Extract'], variants: [{ sizeMl: 50, price: 1799, stock: 38 }, { sizeMl: 100, price: 2999, stock: 18 }] },
  { name: 'Aqua Vetiver', categorySlug: 'eau-de-toilette', brandSlug: 'velvet-amber-co', gender: Gender.MALE, concentration: Concentration.EDT, longevity: 'MODERATE', projection: 'MODERATE', season: ['SUMMER', 'SPRING'], occasion: ['DAILY', 'OFFICE'], basePrice: 1899, notes: { top: ['Sea Salt', 'Bergamot'], middle: ['Vetiver'], base: ['Musk'] }, ingredients: ['Vetiver Oil', 'Sea Salt Accord'], variants: [{ sizeMl: 50, price: 1899, stock: 33 }, { sizeMl: 100, price: 3099, stock: 16 }] },
  { name: 'Green Tea Cologne', categorySlug: 'eau-de-toilette', brandSlug: 'noor-al-sharq', gender: Gender.UNISEX, concentration: Concentration.EDT, longevity: 'WEAK', projection: 'INTIMATE', season: ['SUMMER'], occasion: ['DAILY'], basePrice: 1399, notes: { top: ['Green Tea', 'Mint'], middle: ['Jasmine'], base: ['White Musk'] }, ingredients: ['Green Tea Extract', 'Mint Oil'], variants: [{ sizeMl: 50, price: 1399, stock: 42 }, { sizeMl: 100, price: 2299, stock: 20 }] },
  { name: 'Blue Ocean Sport', categorySlug: 'eau-de-toilette', brandSlug: 'bagh-e-firdaus', gender: Gender.MALE, concentration: Concentration.EDT, longevity: 'MODERATE', projection: 'MODERATE', season: ['SUMMER'], occasion: ['DAILY', 'OFFICE'], basePrice: 1699, notes: { top: ['Marine Accord'], middle: ['Lavender'], base: ['Amberwood'] }, ingredients: ['Marine Accord', 'Lavender Oil'], variants: [{ sizeMl: 50, price: 1699, stock: 36 }, { sizeMl: 100, price: 2799, stock: 19 }] },
  { name: 'Peach Blossom EDT', categorySlug: 'eau-de-toilette', brandSlug: 'zahra-oud-house', gender: Gender.FEMALE, concentration: Concentration.EDT, longevity: 'MODERATE', projection: 'INTIMATE', season: ['SPRING', 'SUMMER'], occasion: ['DAILY'], basePrice: 1599, notes: { top: ['Peach'], middle: ['Freesia'], base: ['Musk'] }, ingredients: ['Peach Extract', 'Freesia Absolute'], variants: [{ sizeMl: 50, price: 1599, stock: 37 }, { sizeMl: 100, price: 2599, stock: 21 }] },
  { name: 'Hindi Oud Supreme', categorySlug: 'oud-collection', brandSlug: 'zahra-oud-house', gender: Gender.UNISEX, concentration: Concentration.ATTAR, longevity: 'VERY_LONG', projection: 'ENORMOUS', season: ['WINTER'], occasion: ['WEDDING'], basePrice: 4999, notes: { top: ['Smoky Incense'], middle: ['Agarwood'], base: ['Amber', 'Musk'] }, ingredients: ['Hindi Agarwood Oil', 'Amber Resin'], variants: [{ sizeMl: 6, price: 1999, stock: 20 }, { sizeMl: 12, price: 3499, stock: 12 }] },
  { name: 'Cambodian Oud Elite', categorySlug: 'oud-collection', brandSlug: 'atarlab-reserve', gender: Gender.MALE, concentration: Concentration.ATTAR, longevity: 'VERY_LONG', projection: 'ENORMOUS', season: ['WINTER', 'AUTUMN'], occasion: ['WEDDING', 'PARTY'], basePrice: 5499, notes: { top: ['Spice Accord'], middle: ['Cambodian Oud'], base: ['Leather'] }, ingredients: ['Cambodian Agarwood Oil', 'Leather Accord'], variants: [{ sizeMl: 6, price: 2199, stock: 15 }, { sizeMl: 12, price: 3899, stock: 8 }] },
  { name: 'Oud Rose Fusion', categorySlug: 'oud-collection', brandSlug: 'noor-al-sharq', gender: Gender.UNISEX, concentration: Concentration.ATTAR, longevity: 'VERY_LONG', projection: 'STRONG', season: ['WINTER'], occasion: ['WEDDING', 'PARTY'], basePrice: 3799, notes: { top: ['Saffron'], middle: ['Rose', 'Oud'], base: ['Musk'] }, ingredients: ['Agarwood Oil', 'Rose Absolute'], variants: [{ sizeMl: 6, price: 1599, stock: 22 }, { sizeMl: 12, price: 2799, stock: 14 }] },
  { name: 'Royal Bakhoor Oud', categorySlug: 'oud-collection', brandSlug: 'bagh-e-firdaus', gender: Gender.UNISEX, concentration: Concentration.ATTAR, longevity: 'VERY_LONG', projection: 'STRONG', season: ['WINTER', 'AUTUMN'], occasion: ['WEDDING'], basePrice: 4299, notes: { top: ['Incense'], middle: ['Oud'], base: ['Amber'] }, ingredients: ['Bakhoor Extract', 'Amber Resin'], variants: [{ sizeMl: 6, price: 1799, stock: 18 }, { sizeMl: 12, price: 3199, stock: 10 }] },
  { name: 'Sultan Oud Reserve', categorySlug: 'oud-collection', brandSlug: 'velvet-amber-co', gender: Gender.MALE, concentration: Concentration.ATTAR, longevity: 'VERY_LONG', projection: 'ENORMOUS', season: ['WINTER'], occasion: ['WEDDING', 'PARTY'], basePrice: 5999, notes: { top: ['Cardamom'], middle: ['Aged Oud'], base: ['Musk', 'Amber'] }, ingredients: ['Aged Agarwood Oil', 'White Musk'], variants: [{ sizeMl: 6, price: 2499, stock: 12 }, { sizeMl: 12, price: 4299, stock: 6 }] },
  { name: 'Citrus Splash Mist', categorySlug: 'body-mists', brandSlug: 'atarlab-reserve', gender: Gender.UNISEX, concentration: Concentration.EDT, longevity: 'WEAK', projection: 'INTIMATE', season: ['SUMMER'], occasion: ['DAILY'], basePrice: 899, notes: { top: ['Orange'], middle: ['Neroli'], base: ['Musk'] }, ingredients: ['Orange Peel Extract', 'Neroli'], variants: [{ sizeMl: 100, price: 899, stock: 60 }, { sizeMl: 200, price: 1499, stock: 40 }] },
  { name: 'Vanilla Bloom Mist', categorySlug: 'body-mists', brandSlug: 'noor-al-sharq', gender: Gender.FEMALE, concentration: Concentration.EDT, longevity: 'WEAK', projection: 'INTIMATE', season: ['SPRING', 'SUMMER'], occasion: ['DAILY'], basePrice: 949, notes: { top: ['Vanilla Flower'], middle: ['Jasmine'], base: ['Musk'] }, ingredients: ['Vanilla Extract', 'Jasmine Absolute'], variants: [{ sizeMl: 100, price: 949, stock: 58 }, { sizeMl: 200, price: 1599, stock: 36 }] },
  { name: 'Coconut Sunset Mist', categorySlug: 'body-mists', brandSlug: 'velvet-amber-co', gender: Gender.FEMALE, concentration: Concentration.EDT, longevity: 'WEAK', projection: 'INTIMATE', season: ['SUMMER'], occasion: ['DAILY'], basePrice: 899, notes: { top: ['Coconut'], middle: ['Frangipani'], base: ['Sandalwood'] }, ingredients: ['Coconut Extract', 'Frangipani Absolute'], variants: [{ sizeMl: 100, price: 899, stock: 55 }, { sizeMl: 200, price: 1499, stock: 33 }] },
  { name: 'Lavender Dreams Mist', categorySlug: 'body-mists', brandSlug: 'zahra-oud-house', gender: Gender.UNISEX, concentration: Concentration.EDT, longevity: 'WEAK', projection: 'INTIMATE', season: ['SPRING'], occasion: ['DAILY'], basePrice: 849, notes: { top: ['Lavender'], middle: ['Chamomile'], base: ['Musk'] }, ingredients: ['Lavender Oil', 'Chamomile Extract'], variants: [{ sizeMl: 100, price: 849, stock: 62 }, { sizeMl: 200, price: 1399, stock: 40 }] },
  { name: 'Berry Fizz Mist', categorySlug: 'body-mists', brandSlug: 'bagh-e-firdaus', gender: Gender.FEMALE, concentration: Concentration.EDT, longevity: 'WEAK', projection: 'INTIMATE', season: ['SUMMER'], occasion: ['DAILY', 'PARTY'], basePrice: 899, notes: { top: ['Raspberry', 'Blackcurrant'], middle: ['Rose'], base: ['Musk'] }, ingredients: ['Berry Accord', 'Rose Extract'], variants: [{ sizeMl: 100, price: 899, stock: 57 }, { sizeMl: 200, price: 1499, stock: 35 }] },
  { name: 'Sandalwood Serenity', categorySlug: 'pure-attars', brandSlug: 'atarlab-reserve', gender: Gender.UNISEX, concentration: Concentration.ATTAR, longevity: 'LONG', projection: 'MODERATE', season: ['AUTUMN', 'WINTER'], occasion: ['OFFICE', 'DAILY'], basePrice: 1799, notes: { top: ['Cardamom'], middle: ['Mysore Sandalwood'], base: ['Musk'] }, ingredients: ['Mysore Sandalwood Oil', 'White Musk'], variants: [{ sizeMl: 6, price: 749, stock: 48 }, { sizeMl: 12, price: 1349, stock: 28 }] },
  { name: 'Patchouli Nights', categorySlug: 'eau-de-parfum', brandSlug: 'noor-al-sharq', gender: Gender.UNISEX, concentration: Concentration.EDP, longevity: 'LONG', projection: 'STRONG', season: ['AUTUMN'], occasion: ['PARTY', 'DAILY'], basePrice: 2699, notes: { top: ['Bergamot'], middle: ['Patchouli'], base: ['Vanilla'] }, ingredients: ['Patchouli Oil', 'Vanilla Bean'], variants: [{ sizeMl: 30, price: 1999, stock: 30 }, { sizeMl: 50, price: 2699, stock: 22 }] },
  { name: 'Tobacco Vanilla EDP', categorySlug: 'eau-de-parfum', brandSlug: 'bagh-e-firdaus', gender: Gender.MALE, concentration: Concentration.EDP, longevity: 'VERY_LONG', projection: 'STRONG', season: ['WINTER', 'AUTUMN'], occasion: ['PARTY', 'WEDDING'], basePrice: 3199, notes: { top: ['Spice Accord'], middle: ['Tobacco Leaf'], base: ['Vanilla', 'Amber'] }, ingredients: ['Tobacco Absolute', 'Vanilla Extract'], variants: [{ sizeMl: 30, price: 2299, stock: 26 }, { sizeMl: 50, price: 3199, stock: 18 }] },
  { name: 'Fresh Mint Cologne', categorySlug: 'eau-de-toilette', brandSlug: 'velvet-amber-co', gender: Gender.MALE, concentration: Concentration.EDT, longevity: 'WEAK', projection: 'INTIMATE', season: ['SUMMER'], occasion: ['DAILY', 'OFFICE'], basePrice: 1299, notes: { top: ['Mint', 'Lemon'], middle: ['Basil'], base: ['Cedarwood'] }, ingredients: ['Mint Oil', 'Basil Extract'], variants: [{ sizeMl: 50, price: 1299, stock: 44 }, { sizeMl: 100, price: 2199, stock: 24 }] },
  { name: 'Musk Al Jannah', categorySlug: 'oud-collection', brandSlug: 'noor-al-sharq', gender: Gender.UNISEX, concentration: Concentration.ATTAR, longevity: 'VERY_LONG', projection: 'STRONG', season: ['WINTER'], occasion: ['WEDDING', 'DAILY'], basePrice: 3999, notes: { top: ['Rose'], middle: ['Oud', 'Musk'], base: ['Amber'] }, ingredients: ['Agarwood Oil', 'White Musk', 'Amber Resin'], variants: [{ sizeMl: 6, price: 1699, stock: 20 }, { sizeMl: 12, price: 2999, stock: 12 }] },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function seedCatalog(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(Category);
  const brandRepo = dataSource.getRepository(Brand);
  const productRepo = dataSource.getRepository(Product);
  const variantRepo = dataSource.getRepository(ProductVariant);
  const imageRepo = dataSource.getRepository(ProductImage);
  const noteRepo = dataSource.getRepository(FragranceNote);
  const ingredientRepo = dataSource.getRepository(ProductIngredient);

  const categoriesBySlug = new Map<string, Category>();
  for (const [index, c] of CATEGORIES.entries()) {
    let category = await categoryRepo.findOne({ where: { slug: c.slug } });
    category ??= await categoryRepo.save(
      categoryRepo.create({ name: c.name, slug: c.slug, imageUrl: c.image, sortOrder: index }),
    );
    categoriesBySlug.set(c.slug, category);
  }

  const brandsBySlug = new Map<string, Brand>();
  for (const b of BRANDS) {
    let brand = await brandRepo.findOne({ where: { slug: b.slug } });
    brand ??= await brandRepo.save(brandRepo.create({ name: b.name, slug: b.slug }));
    brandsBySlug.set(b.slug, brand);
  }

  let created = 0;
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const existing = await productRepo.findOne({ where: { slug } });
    if (existing) continue;

    const product = await productRepo.save(
      productRepo.create({
        name: p.name,
        slug,
        categoryId: categoriesBySlug.get(p.categorySlug)!.id,
        brandId: brandsBySlug.get(p.brandSlug)!.id,
        shortDescription: `${p.name} — a ${p.concentration.toLowerCase()} fragrance with ${p.notes.middle[0].toLowerCase()} at its heart.`,
        description: `${p.name} opens with ${p.notes.top.join(', ')}, blooms into ${p.notes.middle.join(', ')}, and settles into a warm base of ${p.notes.base.join(', ')}. Crafted for those who appreciate a distinctive, long-lasting signature scent.`,
        gender: p.gender,
        concentration: p.concentration,
        longevity: p.longevity,
        projection: p.projection,
        season: p.season,
        occasion: p.occasion,
        basePrice: p.basePrice,
        isActive: true,
        isFeatured: Math.random() > 0.7,
      }),
    );

    await variantRepo.save(
      p.variants.map((v, i) =>
        variantRepo.create({
          productId: product.id,
          sku: `${slug}-${v.sizeMl}ML`.toUpperCase(),
          sizeMl: v.sizeMl,
          price: v.price,
          compareAtPrice: i === p.variants.length - 1 ? Math.round(v.price * 1.15) : null,
          stockQuantity: v.stock,
        }),
      ),
    );

    await imageRepo.save([
      imageRepo.create({
        productId: product.id,
        url: `https://picsum.photos/seed/${slug}-1/800/1000`,
        altText: p.name,
        sortOrder: 0,
      }),
      imageRepo.create({
        productId: product.id,
        url: `https://picsum.photos/seed/${slug}-2/800/1000`,
        altText: `${p.name} bottle detail`,
        sortOrder: 1,
      }),
    ]);

    const notes: Array<{ type: NoteType; names: string[] }> = [
      { type: NoteType.TOP, names: p.notes.top },
      { type: NoteType.MIDDLE, names: p.notes.middle },
      { type: NoteType.BASE, names: p.notes.base },
    ];
    await noteRepo.save(
      notes.flatMap(({ type, names }) =>
        names.map((name, i) => noteRepo.create({ productId: product.id, noteType: type, name, sortOrder: i })),
      ),
    );

    await ingredientRepo.save(p.ingredients.map((name) => ingredientRepo.create({ productId: product.id, name })));

    created += 1;
  }

  console.log(
    `Seeded ${categoriesBySlug.size} categories, ${brandsBySlug.size} brands, and ${created} new products (${PRODUCTS.length} total defined).`,
  );
}
