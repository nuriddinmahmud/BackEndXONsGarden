import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEnergyDto } from './dto/create-energy.dto';
import { UpdateEnergyDto } from './dto/update-energy.dto';
import { PaginationDto, SortOrder } from './dto/pagination-query.dto';

@Injectable()
export class EnergyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEnergyDto) {
    try {
      const created = await this.prisma.energy.create({
        data: {
          date: new Date(dto.date),
          amountPaid: dto.amountPaid,
          comment: dto.comment,
        },
      });
      return { message: 'Energy created', data: created };
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
      minAmount,
      maxAmount,
    } = query;

    const allowedSort = ['date', 'amountPaid', 'comment'];
    if (!allowedSort.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const where: any = {};

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amountPaid = {};
      if (minAmount !== undefined) where.amountPaid.gte = minAmount;
      if (maxAmount !== undefined) where.amountPaid.lte = maxAmount;
    }

    const skip = (page - 1) * limit;

    try {
      const [data, total, sumAgg] = await this.prisma.$transaction([
        this.prisma.energy.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.energy.count({ where }),
        this.prisma.energy.aggregate({
          where,
          _sum: { amountPaid: true },
        }),
      ]);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
          sumAmount: sumAgg._sum.amountPaid ?? 0,
          sortBy,
          sortOrder,
          filters: { search, dateFrom, dateTo, minAmount, maxAmount },
        },
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: number) {
    const energy = await this.prisma.energy.findUnique({ where: { id } });
    if (!energy) throw new NotFoundException('Energy not found');
    return { data: energy };
  }

  async update(id: number, dto: UpdateEnergyDto) {
    const exists = await this.prisma.energy.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Energy not found');

    try {
      const updated = await this.prisma.energy.update({
        where: { id },
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}),
          ...(dto.amountPaid !== undefined ? { amountPaid: dto.amountPaid } : {}),
          ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
        },
      });
      return { message: 'Energy updated', data: updated };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: number) {
    const exists = await this.prisma.energy.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Energy not found');

    try {
      const deleted = await this.prisma.energy.delete({ where: { id } });
      return { message: 'Energy deleted', data: deleted };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
