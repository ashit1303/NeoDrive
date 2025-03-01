// typesense.module.ts
import { Global, Module } from '@nestjs/common';
import { TypesenseService } from './typesense.service';

@Global()
@Module({
  providers: [TypesenseService],
  exports: [TypesenseService],
})
export class TypesenseModule {}