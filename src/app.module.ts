import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { User } from './users/user.entity';
import { Chat } from './chats/chat.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // можно использовать в любом модуле без импорта
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [User, Chat],
      }),
    }),
    UsersModule,
    AuthModule,
    ChatsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
