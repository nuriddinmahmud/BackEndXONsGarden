import { PartialType } from '@nestjs/swagger';
import { CreateDrainageDto } from './create-drainage.dto';

export class UpdateDrainageDto extends PartialType(CreateDrainageDto) {}
