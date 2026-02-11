import { Body, Controller, Post } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chats')
export class ChatsController {
    constructor(private chatsService: ChatsService) {}
    
    @Post()
    createChat(@Body() dto: CreateChatDto) {
        return this.chatsService.createChat(dto);
    }
}
