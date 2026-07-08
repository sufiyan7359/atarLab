import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(@InjectRepository(Address) private readonly repo: Repository<Address>) {}

  findAllForUser(userId: string): Promise<Address[]> {
    return this.repo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async findOneOwned(id: string, userId: string): Promise<Address> {
    const address = await this.repo.findOne({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException();
    return address;
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }
    const existingCount = await this.repo.count({ where: { userId } });
    const address = this.repo.create({
      ...dto,
      userId,
      isDefault: dto.isDefault ?? existingCount === 0,
    });
    return this.repo.save(address);
  }

  async update(id: string, userId: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOneOwned(id, userId);
    if (dto.isDefault) {
      await this.repo.update({ userId }, { isDefault: false });
    }
    Object.assign(address, dto);
    return this.repo.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOneOwned(id, userId);
    await this.repo.remove(address);
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOneOwned(id, userId);
    await this.repo.update({ userId }, { isDefault: false });
    address.isDefault = true;
    return this.repo.save(address);
  }
}
