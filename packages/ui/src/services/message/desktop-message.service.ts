import { toDisposable } from '@univerjs/core';
import type { IMessageMethodOptions, IMessageProps } from '@univerjs/design';
import { Message } from '@univerjs/design';
import type { IDisposable } from '@wendellhu/redi';

import type { IMessageService } from './message.service';

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
