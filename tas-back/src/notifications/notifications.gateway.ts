import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/ws/notifications',
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  // Mapeo de userId -> socketId
  private activeSockets = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
  ) { }

  afterInit(server: Server) {
    this.logger.log('NotificationsGateway Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromClient(client);

      if (!token) {
        throw new Error('No token provided');
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!userId) {
        throw new Error('Invalid token payload');
      }

      // Guardar en el mapeo
      this.activeSockets.set(userId, client.id);
      console.log('AQUQUII');

      this.logger.log(`Client connected: ${client.id} - User ID: ${userId}`);
    } catch (error: any) {
      this.logger.error(`Connection rejected: ${client.id} - ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Buscar y eliminar el socketId desconectado
    for (const [userId, socketId] of this.activeSockets.entries()) {
      if (socketId === client.id) {
        this.activeSockets.delete(userId);
        this.logger.log(`Client disconnected: ${client.id} - User ID: ${userId}`);
        break;
      }
    }
  }

  // Método público para que el servicio emita notificaciones específicas
  sendNotificationToUser(userId: string, event: string, payload: any) {
    const socketId = this.activeSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
      this.logger.log(`Event '${event}' emitted to User ID: ${userId}`);
    }
  }

  private extractTokenFromClient(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    const tokenQuery = client.handshake.query.token;
    if (tokenQuery) {
      return tokenQuery as string;
    }
    return null;
  }

  @SubscribeMessage('project_view')
  async handleProjectView(
    @MessageBody() data: {
      projectId: string;
      ownerId: string;
      title: string;
    },
    @ConnectedSocket() client: Socket,
  ) {

    const token = this.extractTokenFromClient(client);

    if (!token) return;

    const payload = this.jwtService.verify(token);
    const viewerId = payload.sub;


    if (viewerId === data.ownerId) {
      return;
    }


    this.sendNotificationToUser(
      data.ownerId,
      'project_viewed',
      {
        message: `Hay alguien viendo tu proyecto ${data.title}`,
        projectId: data.projectId,
        title: data.title
      }
    );
  }
}
