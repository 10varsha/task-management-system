import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('organization')
  @Roles(Role.ADMIN, Role.OWNER)
  async getUsersInOrganization(@CurrentUser() user: User) {
    return this.usersService.findByOrganization(user.organizationId, user);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(Role.OWNER)
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: Role,
    @CurrentUser() user: User,
  ) {
    return this.usersService.updateRole(id, role, user);
  }
}
