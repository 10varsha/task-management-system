import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(Role.OWNER)
  async create(
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('parentId') parentId?: string,
  ) {
    return this.organizationsService.create(name, description, parentId);
  }

  @Get()
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get(':id/hierarchy')
  @Roles(Role.ADMIN, Role.OWNER)
  async findWithHierarchy(@Param('id') id: string) {
    return this.organizationsService.findWithHierarchy(id);
  }
}
