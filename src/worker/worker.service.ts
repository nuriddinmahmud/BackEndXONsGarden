import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { QueryWorkerDto } from './dto/pagination-query.dto';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWorkerDto) {
    const totalSalary =
      dto.totalSalary ?? dto.workerCount * dto.salaryPerOne;

    return this.prisma.worker.create({
      data: {
        date: new Date(dto.date),
        workerCount: dto.workerCount,
        salaryPerOne: dto.salaryPerOne,
        totalSalary,
        comment: dto.comment,
      },
    });
  }

  async findAll(q: QueryWorkerDto) {
    const { page, limit, search, dateFrom, dateTo, sortBy, sortOrder } = q;

    const and: Prisma.WorkerWhereInput[] = [];

    if (search) {
      and.push({
        comment: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      });
    }

    if (dateFrom || dateTo) {
      and.push({
        date: {
          gte: dateFrom ? new Date(dateFrom) : undefined,
          lte: dateTo ? new Date(dateTo) : undefined,
        },
      });
    }

    const where: Prisma.WorkerWhereInput = and.length ? { AND: and } : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.worker.count({ where }),
      this.prisma.worker.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        sortBy,
        sortOrder,
        filters: {
          search: search ?? null,
          dateFrom: dateFrom ?? null,
          dateTo: dateTo ?? null,
        },
      },
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.worker.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Worker not found');
    return item;
  }

  async update(id: number, dto: UpdateWorkerDto) {
    let totalSalary = dto.totalSalary;
    if (totalSalary == null && (dto.workerCount != null || dto.salaryPerOne != null)) {
      const current = await this.prisma.worker.findUnique({ where: { id } });
      if (!current) throw new NotFoundException('Worker not found');

      const workerCount = dto.workerCount ?? current.workerCount;
      const salaryPerOne = dto.salaryPerOne ?? current.salaryPerOne;
      totalSalary = workerCount * salaryPerOne;
    }

    const updated = await this.prisma.worker.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        workerCount: dto.workerCount,
        salaryPerOne: dto.salaryPerOne,
        totalSalary: totalSalary ?? undefined,
        comment: dto.comment,
      },
    });

    return updated;
  }

  async remove(id: number) {
    await this.prisma.worker.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
