import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  errors: any;

  constructor(response: any) {
    super(response, HttpStatus.UNPROCESSABLE_ENTITY);
    this.errors = response;
  }
}
