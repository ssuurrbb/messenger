// WebSocket gateway для обработки real-time сообщений через Socket.IO
// Используется вместе с NestJS WebSocketGateway
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class MessagesGateway {
  // Логгер для отладки подключений/событий
  private readonly logger = new Logger(MessagesGateway.name);

  // Сюда будет проксироваться экземпляр socket.io Server
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  // Вызывается при подключении клиента
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Вызывается при отключении клиента
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Обработчик события 'join' — клиент просит присоединиться к комнате (chatId)
  // payload: { chatId }
  @SubscribeMessage('join')
  handleJoin(@MessageBody() payload: { chatId: number }, @ConnectedSocket() client: Socket) {
    const room = String(payload.chatId);
    client.join(room); // добавляем сокет в комнату по chatId
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  // Обработчик события 'sendMessage' — клиент отправляет сообщение через сокет
  // Ожидаем payload: { chatId, text, userId }
  // Алгоритм:
  // 1) ищем пользователя по userId (в простом варианте клиент передаёт userId)
  // 2) вызываем MessagesService.createMessage для валидации/сохранения
  // 3) рассылаем сохранённое сообщение всем участникам комнаты
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() payload: { chatId: number; text: string; userId: number }) {
    const user = await this.usersService.findById(payload.userId);
    if (!user) return; // если пользователь не найден — игнорируем

    // Сохраняем сообщение используя логику сервиса (проверка членства и т.д.)
    const saved = await this.messagesService.createMessage({ chatId: payload.chatId, text: payload.text }, user as any);

    // Эмитим событие 'message' во все сокеты, находящиеся в комнате chatId
    this.server.to(String(payload.chatId)).emit('message', saved);
    return saved;
  }
}
