import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  async findAll() {
    return this.auditLogService.findAll();
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.OWNER)
  async findByUser(@Param('userId') userId: string) {
    return this.auditLogService.findByUser(userId);
  }
}
