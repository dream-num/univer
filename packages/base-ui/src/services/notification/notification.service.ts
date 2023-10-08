import { createIdentifier, IDisposable } from '@wendellhu/redi';

export const INotificationService = createIdentifier<INotificationService>('univer.notification-service');

export interface INotificationShowParams {
    title: string;
}

export interface INotificationService {
    show(params: INotificationShowParams): IDisposable;
}
