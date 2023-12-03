import { toDisposable } from '@univerjs/core';
import { IMessageMethodOptions, IMessageProps, Message } from '@univerjs/design';
import { IDisposable } from '@wendellhu/redi';

import { IMessageService } from './message.service';

export class DesktopMessageService implements IMessageService {
    portalContainer: HTMLElement = document.body;
    message?: Message;

    setContainer(container: HTMLElement): void {
        this.portalContainer = container;
        this.message = new Message(container);
    }

    show(options: IMessageMethodOptions & Omit<IMessageProps, 'key'>): IDisposable {
        const { type, ...rest } = options;

        this.message && this.message[type](rest);

        return toDisposable(() => {});
    }
}
