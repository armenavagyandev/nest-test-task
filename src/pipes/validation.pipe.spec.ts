import { ValidationPipe } from './validation.pipe';
import { IsEmail, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ArgumentMetadata } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';
import { faker } from '@faker-js/faker';

class TestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  age: number;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe();
  });

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: TestDto,
    data: '',
  };

  it('should throw ValidationException if name is empty', async () => {
    const invalidValue = { age: faker.number.int(), email: faker.internet.email() };

    await expect(pipe.transform(invalidValue, metadata)).rejects.toThrow(ValidationException);

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect(err.errors.messages).toEqual({
        name: 'name should not be empty',
      });
    }
  });

  it('should throw ValidationException if name is not string', async () => {
    const invalidValue = {
      age: faker.number.int(),
      email: faker.internet.email(),
      name: ['Not a sting'],
    };

    await expect(pipe.transform(invalidValue, metadata)).rejects.toThrow(ValidationException);

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect(err.errors.messages).toEqual({
        name: 'name must be a string',
      });
    }
  });

  it('should throw ValidationException if age is empty', async () => {
    const invalidValue = {
      email: faker.internet.email(),
      name: faker.internet.username(),
    };

    await expect(pipe.transform(invalidValue, metadata)).rejects.toThrow(ValidationException);

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect(err.errors.messages).toEqual({
        age: 'age should not be empty',
      });
    }
  });

  it('should throw ValidationException if age is not integer', async () => {
    const invalidValue = {
      age: ['Not an integer'],
      email: faker.internet.email(),
      name: faker.internet.username(),
    };

    await expect(pipe.transform(invalidValue, metadata)).rejects.toThrow(ValidationException);

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect(err.errors.messages).toEqual({
        age: 'age must be an integer number',
      });
    }
  });

  it('should throw ValidationException if email is empty', async () => {
    const invalidValue = {
      age: faker.number.int(),
      name: faker.internet.username(),
    };

    await expect(pipe.transform(invalidValue, metadata)).rejects.toThrow(ValidationException);

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect(err.errors.messages).toEqual({
        email: 'email should not be empty',
      });
    }
  });

  it('should throw ValidationException if email is not string', async () => {
    const invalidValue = {
      age: faker.number.int(),
      name: faker.internet.username(),
      email: ['Not a string'],
    };

    await expect(pipe.transform(invalidValue, metadata)).rejects.toThrow(ValidationException);

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect(err.errors.messages).toEqual({
        email: 'email must be a string',
      });
    }
  });

  it('should throw ValidationException if email is not valid', async () => {
    const invalidValue = {
      age: faker.number.int(),
      name: faker.internet.username(),
      email: faker.string.uuid(),
    };

    await expect(pipe.transform(invalidValue, metadata)).rejects.toThrow(ValidationException);

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect(err.errors.messages).toEqual({
        email: 'email must be an email',
      });
    }
  });
});
