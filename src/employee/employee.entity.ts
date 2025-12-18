import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('employees')
export class Employee {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column('double')
  hourlyRate: number;
}
