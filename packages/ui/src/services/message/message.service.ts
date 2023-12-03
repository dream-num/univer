import type { IMessageMethodOptions, IMessageProps } from '@univerjs/design';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';

export const IMessageService = createIdentifier<IMessageService>('univer.message-service');

export interface IMessageService {
    show(options: IMessageMethodOptions & Omit<IMessageProps, 'key'>): IDisposable;

    setContainer(container: HTMLElement): void;
}
