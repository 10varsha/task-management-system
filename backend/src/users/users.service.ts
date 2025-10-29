import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findByOrganization(organizationId: string, currentUser: User): Promise<User[]> {
    // Only Owners and Admins can view users in their organization
    if (currentUser.role === Role.VIEWER) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.usersRepository.find({
      where: { organizationId },
      relations: ['organization'],
    });
  }

  async updateRole(userId: string, newRole: Role, currentUser: User): Promise<User> {
    // Only Owners can change roles
    if (currentUser.role !== Role.OWNER) {
      throw new ForbiddenException('Only owners can change user roles');
    }

    const user = await this.findOne(userId);
    
    // Can't change role of users in different organization
    if (user.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException('Cannot modify users from other organizations');
    }

    user.role = newRole;
    return this.usersRepository.save(user);
  }
}
