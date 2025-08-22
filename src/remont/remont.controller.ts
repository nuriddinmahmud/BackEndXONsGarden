import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RemontService } from './remont.service';
import { CreateRemontDto } from './dto/create-remont.dto';
import { UpdateRemontDto } from './dto/update-remont.dto';
import { PaginationDto } from './dto/pagination-query.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Remont')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) // 🔐 faqat token bilan CRUD
@Controller('remont')
export class RemontController {
  constructor(private readonly service: RemontService) {}

  @Post()
  create(@Body() dto: CreateRemontDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['date', 'cost', 'description', 'note', 'createdAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'minCost', required: false })
  @ApiQuery({ name: 'maxCost', required: false })
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRemontDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
