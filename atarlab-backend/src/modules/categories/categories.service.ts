import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  async findAllFlat(): Promise<Category[]> {
    return this.repo.find({ where: { isActive: true }, order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findTree(): Promise<CategoryNode[]> {
    const all = await this.repo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
    const byId = new Map<string, CategoryNode>(all.map((c) => [c.id, { ...c, children: [] } as CategoryNode]));
    const roots: CategoryNode[] = [];
    for (const category of byId.values()) {
      if (category.parentId && byId.has(category.parentId)) {
        byId.get(category.parentId)!.children.push(category);
      } else {
        roots.push(category);
      }
    }
    return roots;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.repo.findOne({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findById(id: string): Promise<Category> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.repo.create({ ...dto, parentId: dto.parentId ?? null });
    return this.repo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    Object.assign(category, dto);
    return this.repo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.repo.remove(category);
  }
}
