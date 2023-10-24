import { createIdentifier, IDisposable } from '@wendellhu/redi';

import { INotificationMethodOptions } from '../../Components/Notification/Notification';

export const INotificationService = createIdentifier<INotificationService>('univer.notification-service');

export interface INotificationService {
    show(params: INotificationMethodOptions): IDisposable;
}
