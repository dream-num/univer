import { createIdentifier, IDisposable } from '@wendellhu/redi';

export const IMessageService = createIdentifier<IMessageService>('univer.message-service');

export enum MessageType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
}

export interface IShowOptions {
    type: MessageType;
    content: string;
    delay?: number;
}

export interface IMessageService {
    show(options: IShowOptions): IDisposable;
}
