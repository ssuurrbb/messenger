import { Controller, Post, Body, Req, UseGuards, Param, Get, ParseIntPipe } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport'; // для JWT
import { MessagesService } from './messages.service';
import { User } from '../common/decorators/user.decorator';

@Controller('messages')
export class MessagesController {
    constructor(private messagesService: MessagesService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async createMessage(
        @Body() dto: CreateMessageDto,
        @User() user,
    ) {
        return this.messagesService.createMessage(dto, user);
    }

    @Get(':chatId')
    @UseGuards(AuthGuard('jwt'))
    async getMessages(
        @Param('chatId', ParseIntPipe) chatId: number,
        @User() user,
    ) {
        return this.messagesService.getMessages(chatId, user);
    }
}
