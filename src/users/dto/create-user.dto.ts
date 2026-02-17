import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @MinLength(4)
  @IsString()
  userNameTag: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
