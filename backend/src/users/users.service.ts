import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
    console.log('UsersService.findOne called with ID:', id); // Debug log

    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        // Make organization relation optional
        relations: ['organization'],
      });

      console.log('User query result:', user); // Debug log

      if (!user) {
        console.error('No user found with ID:', id); // Debug log
        throw new NotFoundException(`User not found with ID: ${id}`);
      }

      return user;
    } catch (error) {
      console.error('Error in findOne:', error); // Debug log
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findByOrganization(
    organizationId: string,
    currentUser: User,
  ): Promise<User[]> {
    if (currentUser.role === Role.VIEWER) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.usersRepository.find({
      where: { organizationId },
      relations: ['organization'],
    });
  }

  async updateRole(
    userId: string,
    newRole: Role,
    currentUser: User,
  ): Promise<User> {
    if (currentUser.role !== Role.OWNER) {
      throw new ForbiddenException('Only owners can change user roles');
    }

    const user = await this.findOne(userId);

    if (user.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException(
        'Cannot modify users from other organizations',
      );
    }

    user.role = newRole;
    return this.usersRepository.save(user);
  }
}
