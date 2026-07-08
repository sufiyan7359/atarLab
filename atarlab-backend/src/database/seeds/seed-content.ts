import { DataSource } from 'typeorm';
import { Testimonial } from '../../modules/content/entities/testimonial.entity';
import { FaqItem } from '../../modules/content/entities/faq-item.entity';
import { SocialPost } from '../../modules/content/entities/social-post.entity';
import { BlogPost } from '../../modules/content/entities/blog-post.entity';

const TESTIMONIALS = [
  { authorName: 'Aisha R.', quote: 'The Royal Oud Musk attar lasted the entire day. Genuinely the best fragrance I\'ve bought online.', rating: 5, sortOrder: 0 },
  { authorName: 'Karan M.', quote: 'Packaging felt premium, and the scent is exactly as described. Will be reordering the Saffron Rose.', rating: 5, sortOrder: 1 },
  { authorName: 'Fatima S.', quote: 'Finally an attar brand that doesn\'t feel synthetic. The oud collection is exceptional.', rating: 5, sortOrder: 2 },
];

const FAQS = [
  { question: 'How long does an attar\'s fragrance last?', answer: 'Our pure attars are formulated for very long longevity — most last 8–12 hours on skin.', sortOrder: 0 },
  { question: 'Do you offer Cash on Delivery?', answer: 'Yes — COD is available at checkout alongside Razorpay for cards, UPI, and wallets.', sortOrder: 1 },
  { question: 'What is your return policy?', answer: 'Unopened items can be returned within 7 days of delivery for a full refund.', sortOrder: 2 },
];

const SOCIAL_POSTS = [
  { imageUrl: 'https://picsum.photos/seed/insta-1/500/500', caption: 'Golden hour with our Oud Al Sultan.', sortOrder: 0 },
  { imageUrl: 'https://picsum.photos/seed/insta-2/500/500', caption: 'Fresh batch of Saffron Rose attar.', sortOrder: 1 },
  { imageUrl: 'https://picsum.photos/seed/insta-3/500/500', caption: 'Behind the scenes at our blending studio.', sortOrder: 2 },
  { imageUrl: 'https://picsum.photos/seed/insta-4/500/500', caption: 'Gift-wrapped and ready to ship.', sortOrder: 3 },
];

const BLOG_POSTS = [
  {
    title: 'The Ancient Art of Attar Making',
    slug: 'ancient-art-of-attar-making',
    excerpt: 'How centuries-old distillation techniques still shape the fragrances we wear today.',
    content:
      'Attar making traces back over a thousand years to the Indian subcontinent and the Middle East, where perfumers used the deg-bhapka method — a hydro-distillation process — to capture the essence of flowers, woods, and spices into a base of pure sandalwood oil. Unlike modern alcohol-based perfumes, attars are entirely oil-based, which is why they sit closer to the skin and evolve slowly over the day. At AtarLab, every batch still goes through the same patient, small-batch process that this craft has always demanded.',
    isPublished: true,
  },
  {
    title: 'How to Make Your Fragrance Last Longer',
    slug: 'how-to-make-fragrance-last-longer',
    excerpt: 'Simple application tricks that noticeably extend an attar\'s longevity.',
    content:
      'Apply attar to pulse points — wrists, neck, behind the ears — right after a shower when pores are still open. A thin layer of unscented moisturizer underneath helps the oil bind rather than evaporate. And resist the urge to rub your wrists together after applying; it breaks down the top notes faster than they\'re meant to fade.',
    isPublished: true,
  },
];

export async function seedContent(dataSource: DataSource): Promise<void> {
  const testimonialRepo = dataSource.getRepository(Testimonial);
  let testimonialsCreated = 0;
  for (const t of TESTIMONIALS) {
    const existing = await testimonialRepo.findOne({ where: { authorName: t.authorName } });
    if (existing) continue;
    await testimonialRepo.save(testimonialRepo.create(t));
    testimonialsCreated += 1;
  }

  const faqRepo = dataSource.getRepository(FaqItem);
  let faqsCreated = 0;
  for (const f of FAQS) {
    const existing = await faqRepo.findOne({ where: { question: f.question } });
    if (existing) continue;
    await faqRepo.save(faqRepo.create(f));
    faqsCreated += 1;
  }

  const socialRepo = dataSource.getRepository(SocialPost);
  let socialCreated = 0;
  for (const s of SOCIAL_POSTS) {
    const existing = await socialRepo.findOne({ where: { imageUrl: s.imageUrl } });
    if (existing) continue;
    await socialRepo.save(socialRepo.create(s));
    socialCreated += 1;
  }

  const blogRepo = dataSource.getRepository(BlogPost);
  let blogCreated = 0;
  for (const b of BLOG_POSTS) {
    const existing = await blogRepo.findOne({ where: { slug: b.slug } });
    if (existing) continue;
    await blogRepo.save(blogRepo.create({ ...b, publishedAt: new Date() }));
    blogCreated += 1;
  }

  console.log(
    `Seeded ${testimonialsCreated} testimonials, ${faqsCreated} FAQs, ${socialCreated} social posts, ${blogCreated} blog posts.`,
  );
}
