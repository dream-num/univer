import { IMessageMethodOptions, IMessageProps } from '@univerjs/design';
import { createIdentifier, IDisposable } from '@wendellhu/redi';

export const IMessageService = createIdentifier<IMessageService>('univer.message-service');

export interface IMessageService {
    show(options: IMessageMethodOptions & Omit<IMessageProps, 'key'>): IDisposable;

    setContainer(container: HTMLElement): void;
}
