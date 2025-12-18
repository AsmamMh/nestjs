import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: MongoRepository<Employee>,
  ) {}

  private ensureValidDates(start: Date, end: Date) {
    if (!(start instanceof Date) || !(end instanceof Date) || isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('startTime and endTime must be valid dates');
    }
    if (start >= end) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }

  async create(dto: CreateEmployeeDto) {
    this.ensureValidDates(dto.startTime, dto.endTime);
    const toSave: Partial<Employee> = {
      startTime: dto.startTime,
      endTime: dto.endTime,
      hourlyRate: dto.hourlyRate,
    };
    const saved = await this.repo.save(toSave as Employee);
    return saved;
  }

  async findAll(): Promise<Employee[]> {
    return this.repo.find();
  }

  private toObjectId(id: string) {
    try {
      return new ObjectId(id);
    } catch (err) {
      throw new BadRequestException('Invalid id');
    }
  }

  async findOne(id: string): Promise<Employee> {
    const _id = this.toObjectId(id);
    const found = await this.repo.findOne({ where: { _id } } as any);
    if (!found) throw new NotFoundException('Employee not found');
    return found;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const _id = this.toObjectId(id);
    const existing = await this.findOne(id);
    const start = dto.startTime ?? existing.startTime;
    const end = dto.endTime ?? existing.endTime;
    if (dto.startTime || dto.endTime) this.ensureValidDates(start, end);
    const updated = Object.assign(existing, dto);
    await this.repo.save(updated as Employee);
    return updated;
  }

  async remove(id: string) {
    const _id = this.toObjectId(id);
    const res = await this.repo.delete({ _id } as any);
    if (res.affected === 0) throw new NotFoundException('Employee not found');
    return { deleted: true };
  }

  calculateWorkedHoursFromDates(start: Date, end: Date): number {
    this.ensureValidDates(start, end);
    const ms = end.getTime() - start.getTime();
    const hours = ms / (1000 * 60 * 60);
    return hours;
  }

  async calculateWorkedHours(id: string): Promise<number> {
    const emp = await this.findOne(id);
    return this.calculateWorkedHoursFromDates(emp.startTime, emp.endTime);
  }

  calculateSalary(hours: number, hourlyRate: number): number {
    return hours * hourlyRate;
  }

  async calculateSalaryForEmployee(id: string): Promise<number> {
    const emp = await this.findOne(id);
    const hours = this.calculateWorkedHoursFromDates(emp.startTime, emp.endTime);
    return this.calculateSalary(hours, emp.hourlyRate);
  }

  calculateTax(salary: number): number {
    return +(salary * 0.09).toFixed(2);
  }

  async calculateTaxForEmployee(id: string): Promise<number> {
    const salary = await this.calculateSalaryForEmployee(id);
    return this.calculateTax(salary);
  }
}
