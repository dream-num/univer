import { createIdentifier, IDisposable } from '@wendellhu/redi';

export const IMessageService = createIdentifier<IMessageService>('univer.message-service');

export interface IMessageService {
    show(): IDisposable;
}
