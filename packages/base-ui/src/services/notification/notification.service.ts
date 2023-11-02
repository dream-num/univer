import { createIdentifier, IDisposable } from '@wendellhu/redi';

import { INotificationMethodOptions } from '../../components/notification/Notification';

export const INotificationService = createIdentifier<INotificationService>('univer.notification-service');

export interface INotificationService {
    show(params: INotificationMethodOptions): IDisposable;
}
