export class CreateNotificationDTO {
  recipientUserId: string;
  senderUserId: string;
  message: string;
  type: string;
  referenceId: string;
}
