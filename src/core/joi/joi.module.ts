import { Module } from '@nestjs/common';
import { JoiValidate } from './joi.service';

@Module({
  providers: [JoiValidate]
})
export class JoiModule {}