import { BadRequestException } from '@nestjs/common';
import { translateValidationsDtos } from '@utils/helpers/translate-validations-dtos';
import { ValidationError } from 'class-validator';

export const dtoExceptions = (errors: ValidationError[]) => {
  const mensajes = errors.flatMap((err) =>
    Object.entries(err.constraints ?? {}).map(([key, _]) =>
      translateValidationsDtos(key, err.property),
    ),
  );
  return new BadRequestException(mensajes);
};
