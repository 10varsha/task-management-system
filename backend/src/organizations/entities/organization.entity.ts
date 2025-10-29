import { Entity, PrimaryGeneratedColumn, Column, TreeParent, TreeChildren, Tree, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('organizations')
@Tree('closure-table')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @TreeParent()
  parent: Organization;

  @TreeChildren()
  children: Organization[];

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @OneToMany(() => Task, task => task.organization)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
