import * as schema from 'src/shared/database/schema';

import { Inject, Injectable } from '@nestjs/common';

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_ORM } from 'src/core/constrants/db.constants';
import { and, eq } from 'drizzle-orm';
import { CreateNotificationDTO } from './dtos/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';
@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE_ORM) private database: PostgresJsDatabase<typeof schema>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async getNotificationTypeId(typeName: string): Promise<string | null> {
    const [type] = await this.database
      .select({
        id: schema.notificationType.id,
      })
      .from(schema.notificationType)
      .where(eq(schema.notificationType.tipo, typeName));

    return type ? type.id : null;
  }

  async create({
    recipientUserId,
    senderUserId,
    message,
    type,
    referenceId,
  }: CreateNotificationDTO): Promise<void> {
    const idType = await this.getNotificationTypeId(type);

    if (!idType) return;

    const [notification] = await this.database
      .insert(schema.notification)
      .values({
        id_tipo_notificacao: idType,
        id_usuario_destinatario: recipientUserId,
        id_usuario_remetente: senderUserId,
        mensagem: message,
        id_referencia: referenceId,
      })
      .returning();

    const [sender] = await this.database
      .select({ name: schema.people.nome })
      .from(schema.people)
      .where(eq(schema.people.id, senderUserId));

    this.notificationsGateway.emitNotificationToUser(recipientUserId, {
      ...notification,
      remetente: sender.name,
    });
  }

  async getPending(userId: string): Promise<any> {
    const notifications = await this.database
      .select({
        id: schema.notification.id,
        id_tipo_notificacao: schema.notification.id_tipo_notificacao,
        id_usuario_remetente: schema.notification.id_usuario_remetente,
        id_usuario_destinatario: schema.notification.id_usuario_destinatario,
        mensagem: schema.notification.mensagem,
        lida: schema.notification.lida,
        id_referencia: schema.notification.id_referencia,
        remetente: schema.people.nome,
      })
      .from(schema.notification)
      .innerJoin(
        schema.people,
        eq(schema.people.id, schema.notification.id_usuario_remetente),
      )
      .where(
        and(
          eq(schema.notification.lida, false), // Notificações não lidas
          eq(schema.notification.id_usuario_destinatario, userId), // Notificações destinadas ao userId
        ),
      );

    return notifications;
  }
}
