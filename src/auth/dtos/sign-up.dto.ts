import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsNumber()
  @IsNotEmpty()
  readonly age: number;

  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
