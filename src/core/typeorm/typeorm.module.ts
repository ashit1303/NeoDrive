
import { Global, Module } from '@nestjs/common';
import { TypeormService} from './typeorm.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TypeormService],
  exports: [TypeormService],
})
export class TypeormModule {}
