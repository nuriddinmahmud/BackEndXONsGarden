import { PartialType } from '@nestjs/swagger';
import { CreateEnergyDto } from './create-energy.dto';

export class UpdateEnergyDto extends PartialType(CreateEnergyDto) {}
