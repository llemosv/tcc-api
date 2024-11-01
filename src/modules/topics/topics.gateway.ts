import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateTopicMessageDTO } from './dtos/create-topic-message.dto';
import { TopicsService } from './topics.service';

@WebSocketGateway()
export class TopicsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly topicsService: TopicsService) {}

  afterInit() {
    console.log('WebSocket Notification Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(_: Socket, payload: CreateTopicMessageDTO) {
    const response = await this.topicsService.createMessage({
      id_topic: payload.id_topic,
      id_autor: payload.id_autor,
      conteudo: payload.conteudo,
    });

    const message = await this.topicsService.getMessageById(response.id);

    this.server.to(payload.id_topic).emit('receiveMessage', message);
  }

  @SubscribeMessage('joinTopic')
  handleJoinTopic(client: Socket, topicId: string) {
    const rooms = Array.from(client.rooms);
    rooms.forEach((room) => {
      if (room !== client.id) {
        client.leave(room);
      }
    });

    client.join(topicId);
    console.log(`Client ${client.id} joined topic ${topicId}`);
  }
}
