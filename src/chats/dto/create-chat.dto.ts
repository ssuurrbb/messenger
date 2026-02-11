import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  userIds: number[];
}
