import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  readonly email: string;
}
