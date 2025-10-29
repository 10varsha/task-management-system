import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: TreeRepository<Organization>,
  ) {}

  async create(name: string, description?: string, parentId?: string): Promise<Organization> {
    const organization = this.organizationsRepository.create({
      name,
      description,
    });

    if (parentId) {
      const parent = await this.findOne(parentId);
      organization.parent = parent;
    }

    return this.organizationsRepository.save(organization);
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async findWithHierarchy(id: string): Promise<Organization> {
    return this.organizationsRepository.findDescendantsTree(
      await this.findOne(id),
    );
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationsRepository.find();
  }
}
