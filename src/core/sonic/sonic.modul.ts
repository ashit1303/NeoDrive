// src/core/sonic/sonic.module.ts
import { Module, Global } from '@nestjs/common';
import { SonicService } from './sonic.service';

@Global()
@Module({
  providers: [SonicService],
  exports: [SonicService],
})
export class SonicModule {}