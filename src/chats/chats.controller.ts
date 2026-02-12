import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../common/decorators/user.decorator';
import { User as UserEntity } from 'src/users/user.entity';

@Controller('chats')
export class ChatsController {
    constructor(private chatsService: ChatsService) {}
    @Post('private/:userId')
@UseGuards(AuthGuard('jwt'))
createPrivate(
  @Param('userId') userId: number,
  @User() user: UserEntity,
) {
  return this.chatsService.createPrivateChat(+userId, user);
}

}
