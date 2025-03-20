import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype) {
      return value;
    }

    const obj = plainToInstance(metadata.metatype, value ?? {});
    const errors = await validate(obj);

    if (errors.length > 0) {
      const handledErrors = errors.reduce(
        (acc, error) => {
          if (error.children?.length) {
            error.children?.forEach((err) => {
              acc.messages[error.property] = {
                ...(acc.messages[error.property] ?? {}),
                [err.property]: Object.values(err.constraints ?? {})?.[0],
              };
            });
          } else {
            acc.messages[error.property] = Object.values(error.constraints ?? {})?.[0];
          }
          return acc;
        },
        {
          messages: {},
        },
      );

      throw new ValidationException(handledErrors);
    }

    return value;
  }
}
