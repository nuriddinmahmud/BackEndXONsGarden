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
import { DrainageService } from './drainage.service';
import { CreateDrainageDto } from './dto/create-drainage.dto';
import { UpdateDrainageDto } from './dto/update-drainage.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination-query.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Drainage')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt')) 
@Controller('drainage')
export class DrainageController {
  constructor(private readonly service: DrainageService) {}

  @Post()
  create(@Body() dto: CreateDrainageDto) {
    return this.service.create(dto);
  }

  @Get()
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
    @Body() dto: UpdateDrainageDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
