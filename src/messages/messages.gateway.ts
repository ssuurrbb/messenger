// WebSocket gateway для обработки real-time сообщений через Socket.IO
// Используется вместе с NestJS WebSocketGateway
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { UsersService } from 'src/users/users.service';

// Явная конфигурация WebSocket с CORS для real-time отправки и редактирования
@WebSocketGateway({ 
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: '*',
  },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
    this.logger.log(`✅ Client connected: ${client.id}`);
  }

  // Вызывается при отключении клиента
  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Client disconnected: ${client.id}`);
  }

  // Обработчик события 'join' — клиент просит присоединиться к комнате (chatId)
  // payload: { chatId }
  @SubscribeMessage('join')
  handleJoin(@MessageBody() payload: { chatId: number }, @ConnectedSocket() client: Socket) {
    const room = String(payload.chatId);
    client.join(room); // добавляем сокет в комнату по chatId
    this.logger.log(`📨 Client ${client.id} joined room ${room}`);
  }

  // Обработчик события 'sendMessage' — клиент отправляет сообщение через сокет
  // Ожидаем payload: { chatId, text, userId }
  // Алгоритм:
  // 1) ищем пользователя по userId (в простом варианте клиент передаёт userId)
  // 2) вызываем MessagesService.createMessage для валидации/сохранения
  // 3) рассылаем сохранённое сообщение всем участникам комнаты
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() payload: { chatId: number; text: string; userId: number }, @ConnectedSocket() client: Socket) {
    try {
      this.logger.log(`📤 sendMessage: chatId=${payload.chatId}, userId=${payload.userId}, text="${payload.text.substring(0, 50)}"`);
      
      const user = await this.usersService.findById(payload.userId);
      if (!user) {
        this.logger.warn(`⚠️ User not found: ${payload.userId}`);
        return; // если пользователь не найден — игнорируем
      }

      // Сохраняем сообщение используя логику сервиса (проверка членства и т.д.)
      const saved = await this.messagesService.createMessage({ chatId: payload.chatId, text: payload.text }, user as any);
      this.logger.log(`✅ Message saved: id=${saved.id}, room=${payload.chatId}`);

      // Эмитим событие 'message' во все сокеты, находящиеся в комнате chatId
      this.server.to(String(payload.chatId)).emit('message', saved);
      this.logger.log(`🔔 Emitted 'message' to room ${payload.chatId}`);
      
      return saved;
    } catch (error) {
      this.logger.error(`❌ sendMessage error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // Обработчик события 'editMessage' — клиент редактирует своё сообщение
  // Ожидаем payload: { messageId, newText, userId, chatId }
  // Алгоритм:
  // 1) ищем пользователя по userId
  // 2) вызываем MessagesService.editMessage (там проверяется, что пользователь — автор сообщения)
  // 3) рассылаем отредактированное сообщение всем в комнате
  @SubscribeMessage('editMessage')
  async handleEditMessage(@MessageBody() payload: { messageId: number; newText: string; userId: number; chatId: number }, @ConnectedSocket() client: Socket) {
    try {
      this.logger.log(`✏️ editMessage: messageId=${payload.messageId}, userId=${payload.userId}, text="${payload.newText.substring(0, 50)}"`);
      
      const user = await this.usersService.findById(payload.userId);
      if (!user) {
        this.logger.warn(`⚠️ User not found: ${payload.userId}`);
        return; // если пользователь не найден — игнорируем
      }

      // Вызываем метод редактирования (проверяет права доступа)
      const edited = await this.messagesService.editMessage(payload.messageId, payload.newText, user as any);
      this.logger.log(`✅ Message edited: id=${edited.id}, room=${payload.chatId}`);

      // Эмитим событие 'editedMessage' во все сокеты в комнате
      this.server.to(String(payload.chatId)).emit('editedMessage', {
        id: edited.id,
        text: edited.text,
        editedAt: edited.editedAt,
      });
      this.logger.log(`🔔 Emitted 'editedMessage' to room ${payload.chatId}`);
      
      return edited;
    } catch (error) {
      // Если ошибка (нет прав, сообщение не найдено) — возвращаем ошибку
      this.logger.error(`❌ editMessage error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }
}
