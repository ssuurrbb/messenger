import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateMessageDto {
    @IsNotEmpty()
    @IsString()
    chatId: number;

    @IsNotEmpty()
    @IsString()
    text: string;
}