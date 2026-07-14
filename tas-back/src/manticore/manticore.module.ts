import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ManticoreService } from './manticore.service';

@Module({
  imports: [HttpModule],
  providers: [ManticoreService],
  exports: [ManticoreService],
})
export class ManticoreModule {}
