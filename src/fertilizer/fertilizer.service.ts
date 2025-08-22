import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFertilizerDto } from './dto/create-fertilizer.dto';
import { UpdateFertilizerDto } from './dto/update-fertilizer.dto';
import { PaginationDto, SortOrder } from './dto/pagination-query.dto';

@Injectable()
export class FertilizerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFertilizerDto) {
    try {
      const created = await this.prisma.fertilizer.create({
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}), 
          fertilizerType: dto.fertilizerType,
          machineCount: dto.machineCount, 
          tonAmount: dto.tonAmount,
          comment: dto.comment,
        },
      });
      return { message: 'Fertilizer created', data: created };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = SortOrder.DESC,
      search,
      machineCount,
      dateFrom,
      dateTo,
      minTon,
      maxTon,
    } = query;

    const allowedSort = ['date', 'tonAmount', 'fertilizerType', 'machineCount', 'comment', 'createdAt'];
    if (!allowedSort.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const where: any = {};

    if (search) {
      where.OR = [
        { fertilizerType: { contains: search, mode: 'insensitive' } },
        { machineCount:   { contains: search, mode: 'insensitive' } },
        { comment:        { contains: search, mode: 'insensitive' } },
      ];
    }

    if (machineCount) {
      where.machineCount = { contains: machineCount, mode: 'insensitive' };
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo)   where.date.lte = new Date(dateTo);
    }

    if (minTon !== undefined || maxTon !== undefined) {
      where.tonAmount = {};
      if (minTon !== undefined) where.tonAmount.gte = minTon;
      if (maxTon !== undefined) where.tonAmount.lte = maxTon;
    }

    const skip = (page - 1) * limit;

    try {
      const [data, total, sumAgg] = await this.prisma.$transaction([
        this.prisma.fertilizer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.fertilizer.count({ where }),
        this.prisma.fertilizer.aggregate({
          where,
          _sum: { tonAmount: true },
        }),
      ]);

      const sumTonAmount = sumAgg?._sum?.tonAmount ?? 0;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
          sumTonAmount,
          sortBy,
          sortOrder,
          filters: { search, machineCount, dateFrom, dateTo, minTon, maxTon },
        },
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: number) {
    const row = await this.prisma.fertilizer.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Fertilizer not found');
    return { data: row };
  }

  async update(id: number, dto: UpdateFertilizerDto) {
    const exists = await this.prisma.fertilizer.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Fertilizer not found');

    try {
      const updated = await this.prisma.fertilizer.update({
        where: { id },
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}),
          ...(dto.fertilizerType !== undefined ? { fertilizerType: dto.fertilizerType } : {}),
          ...(dto.machineCount  !== undefined ? { machineCount: dto.machineCount } : {}),
          ...(dto.tonAmount     !== undefined ? { tonAmount: dto.tonAmount } : {}),
          ...(dto.comment       !== undefined ? { comment: dto.comment } : {}),
        },
      });
      return { message: 'Fertilizer updated', data: updated };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: number) {
    const exists = await this.prisma.fertilizer.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Fertilizer not found');

    try {
      const deleted = await this.prisma.fertilizer.delete({ where: { id } });
      return { message: 'Fertilizer deleted', data: deleted };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
