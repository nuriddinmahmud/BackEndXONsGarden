import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRemontDto } from './dto/create-remont.dto';
import { UpdateRemontDto } from './dto/update-remont.dto';
import { PaginationDto, SortOrder } from './dto/pagination-query.dto';

@Injectable()
export class RemontService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRemontDto) {
    try {
      const created = await this.prisma.remont.create({
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}), // yuborilmasa default(now())
          description: dto.description,
          cost: dto.cost,
          note: dto.note,
        },
      });
      return { message: 'Remont created', data: created };
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
      dateFrom,
      dateTo,
      minCost,
      maxCost,
    } = query;

    const allowedSort = ['date', 'cost', 'description', 'note', 'createdAt'];
    if (!allowedSort.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const where: any = {};

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { note:        { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo)   where.date.lte = new Date(dateTo);
    }

    if (minCost !== undefined || maxCost !== undefined) {
      where.cost = {};
      if (minCost !== undefined) where.cost.gte = minCost;
      if (maxCost !== undefined) where.cost.lte = maxCost;
    }

    const skip = (page - 1) * limit;

    try {
      const [data, total, sumAgg] = await this.prisma.$transaction([
        this.prisma.remont.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.remont.count({ where }),
        this.prisma.remont.aggregate({
          where,
          _sum: { cost: true },
        }),
      ]);

      const sumCost = sumAgg?._sum?.cost ?? 0;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
          sumCost,
          sortBy,
          sortOrder,
          filters: { search, dateFrom, dateTo, minCost, maxCost },
        },
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: number) {
    const row = await this.prisma.remont.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Remont not found');
    return { data: row };
  }

  async update(id: number, dto: UpdateRemontDto) {
    const exists = await this.prisma.remont.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Remont not found');

    try {
      const updated = await this.prisma.remont.update({
        where: { id },
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.cost        !== undefined ? { cost: dto.cost } : {}),
          ...(dto.note        !== undefined ? { note: dto.note } : {}),
        },
      });
      return { message: 'Remont updated', data: updated };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: number) {
    const exists = await this.prisma.remont.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Remont not found');

    try {
      const deleted = await this.prisma.remont.delete({ where: { id } });
      return { message: 'Remont deleted', data: deleted };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
