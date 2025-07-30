import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

@Module({
    imports: [PrismaModule],
    providers: [MetricsService],
    controllers: [MetricsController],
})
export class MetricsModule { }
