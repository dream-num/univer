import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';

import type { INotificationMethodOptions } from '../../components/notification/Notification';

export const INotificationService = createIdentifier<INotificationService>('univer.notification-service');

export interface INotificationService {
    show(params: INotificationMethodOptions): IDisposable;
}
