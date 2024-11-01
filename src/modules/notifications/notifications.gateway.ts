import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinNotifications')
  handleJoinNotifications(client: Socket, userId: string) {
    client.join(userId);
    console.log(
      `Cliente ${client.id} entrou na sala de notificações do usuário ${userId}`,
    );
  }

  emitNotificationToUser(userId: string, notification: any) {
    console.log('Emitindo notificação para o usuário:', userId, notification);
    this.server.to(userId).emit('receiveNotification', notification);
  }
}
