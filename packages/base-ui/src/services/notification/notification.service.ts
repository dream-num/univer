import { createIdentifier, IDisposable } from '@wendellhu/redi';

export const INotificationService = createIdentifier<INotificationService>('univer.notification-service');

export interface INotificationService {
    show(): IDisposable;
}
