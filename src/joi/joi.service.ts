import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import Joi from 'joi'; // Import Joi

@Injectable()
export class JoiValidate implements PipeTransform {
  constructor(private readonly schema: Joi.Schema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const { error } = this.schema.validate(value); // Validate using Joi
    if (error) {
      throw new BadRequestException(error.details[0].message); // Throw a BadRequestException with the error message
    }
    return value; // Return the validated value
  }
}