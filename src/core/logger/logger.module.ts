import { Global, Module } from "@nestjs/common";
import { ZincLogger } from "./zinc.service";

@Global()
@Module({
  providers: [ZincLogger],
  exports: [ZincLogger],
})
export class LoggerModule {}
