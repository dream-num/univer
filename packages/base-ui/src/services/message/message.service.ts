import { createIdentifier, IDisposable } from '@wendellhu/redi';

export const IMessageService = createIdentifier<IMessageService>('univer.message-service');

export interface IShowOptions {
    type: 'success' | 'warning' | 'error';
    content: string;
    delay?: number;
}

export interface IMessageService {
    show(options: IShowOptions): IDisposable;
}
