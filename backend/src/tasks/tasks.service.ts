import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private auditLogService: AuditLogService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      createdById: user.id,
      organizationId: user.organizationId,
    });

    const savedTask = await this.tasksRepository.save(task);

    await this.auditLogService.log({
      userId: user.id,
      userEmail: user.email,
      action: 'TASK_CREATED',
      resource: 'Task',
      resourceId: savedTask.id,
      metadata: { title: savedTask.title },
    });

    return savedTask;
  }

  async findAll(user: User): Promise<Task[]> {
    // Scope tasks to user's organization
    return this.tasksRepository.find({
      where: { organizationId: user.organizationId },
      relations: ['createdBy', 'assignedTo'],
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo', 'organization'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Ensure task belongs to user's organization
    if (task.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied to this task');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user);

    // Viewers cannot edit tasks
    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot edit tasks');
    }

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.tasksRepository.save(task);

    await this.auditLogService.log({
      userId: user.id,
      userEmail: user.email,
      action: 'TASK_UPDATED',
      resource: 'Task',
      resourceId: task.id,
      metadata: { changes: updateTaskDto },
    });

    return updatedTask;
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);

    // Only Admins and Owners can delete tasks
    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }

    await this.tasksRepository.remove(task);

    await this.auditLogService.log({
      userId: user.id,
      userEmail: user.email,
      action: 'TASK_DELETED',
      resource: 'Task',
      resourceId: id,
      metadata: { title: task.title },
    });
  }
}
