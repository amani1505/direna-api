import { Module } from '@nestjs/common';
import { GenerateUniqueNumberUtil } from './generate-unique-number.util';

@Module({
  providers: [GenerateUniqueNumberUtil],
  exports: [GenerateUniqueNumberUtil], // Export the provider
})
export class UtilsModule {}
