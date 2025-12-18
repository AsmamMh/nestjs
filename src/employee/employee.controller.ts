import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly svc: EmployeeService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Get(':id/hours')
  workedHours(@Param('id') id: string) {
    return this.svc.calculateWorkedHours(id);
  }

  @Get(':id/salary')
  salary(@Param('id') id: string) {
    return this.svc.calculateSalaryForEmployee(id);
  }

  @Get(':id/tax')
  tax(@Param('id') id: string) {
    return this.svc.calculateTaxForEmployee(id);
  }
}
