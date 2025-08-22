import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { QueryWorkerDto } from './dto/pagination-query.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Worker')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // 🔐 faqat token bilan CRUD
@Controller('worker')
export class WorkerController {
  constructor(private readonly service: WorkerService) {}

  @Post()
  create(@Body() dto: CreateWorkerDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'mavsumiy' })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    example: '2025-08-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    example: '2025-08-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    example: 'date',
    enum: ['date', 'workerCount', 'salaryPerOne', 'totalSalary'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  findAll(@Query() q: QueryWorkerDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkerDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
