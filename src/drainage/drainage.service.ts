import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDrainageDto } from './dto/create-drainage.dto';
import { UpdateDrainageDto } from './dto/update-drainage.dto';
import { PaginationDto, SortOrder } from './dto/pagination-query.dto';

@Injectable()
export class DrainageService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDrainageDto) {
    try {
      const created = await this.prisma.drainage.create({
        data: {
          date: dto.date ? new Date(dto.date) : undefined, 
          hoursWorked: dto.hoursWorked,
          totalSalary: dto.totalSalary,
        },
      });
      return { message: '✅ Drainage yaratildi', data: created };
    } catch (e: any) {
      throw new BadRequestException(e.message || '❌ Drainage yaratishda xatolik');
    }
  }

  async findAll(query: PaginationDto) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = SortOrder.DESC,
        dateFrom,
        dateTo,
        minHours,
        maxHours,
        minTotal,
        maxTotal,
      } = query;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) where.date.lte = new Date(dateTo);
      }

      if (minHours !== undefined || maxHours !== undefined) {
        where.hoursWorked = {};
        if (minHours !== undefined) where.hoursWorked.gte = Number(minHours);
        if (maxHours !== undefined) where.hoursWorked.lte = Number(maxHours);
      }

      if (minTotal !== undefined || maxTotal !== undefined) {
        where.totalSalary = {};
        if (minTotal !== undefined) where.totalSalary.gte = Number(minTotal);
        if (maxTotal !== undefined) where.totalSalary.lte = Number(maxTotal);
      }

      const [items, total] = await this.prisma.$transaction([
        this.prisma.drainage.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder.toLowerCase() as 'asc' | 'desc' },
        }),
        this.prisma.drainage.count({ where }),
      ]);

      const lastPage = Math.max(1, Math.ceil(total / limit));

      return {
        data: items,
        meta: {
          total,
          page,
          limit,
          lastPage,
          hasNext: page < lastPage,
          hasPrev: page > 1,
          sortBy,
          sortOrder,
          filters: { dateFrom, dateTo, minHours, maxHours, minTotal, maxTotal },
        },
      };
    } catch (e: any) {
      throw new BadRequestException(e.message || '❌ Ro‘yxatni olishda xatolik');
    }
  }

  async findOne(id: number) {
    try {
      const drainage = await this.prisma.drainage.findUnique({ where: { id } });
      if (!drainage) throw new NotFoundException('❌ Drainage topilmadi');
      return { message: '✅ Topildi', data: drainage };
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message || '❌ Drainage topishda xatolik');
    }
  }

  async update(id: number, dto: UpdateDrainageDto) {
    try {
      const exist = await this.prisma.drainage.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('❌ Drainage topilmadi');

      const updated = await this.prisma.drainage.update({
        where: { id },
        data: {
          date: dto.date ? new Date(dto.date) : undefined,
          hoursWorked: dto.hoursWorked,
          totalSalary: dto.totalSalary,
        },
      });

      return { message: '✅ Yangilandi', data: updated };
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message || '❌ Drainage yangilashda xatolik');
    }
  }

  async remove(id: number) {
    try {
      const exist = await this.prisma.drainage.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('❌ Drainage topilmadi');

      await this.prisma.drainage.delete({ where: { id } });
      return { message: '✅ O‘chirildi' };
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e.message || '❌ Drainage o‘chirishda xatolik');
    }
  }
}
