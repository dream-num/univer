import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

import { message } from '../../Components/Message';
import { IMessageService, IShowOptions } from './message.service';

export class DesktopMessageService implements IMessageService {
    show(options: IShowOptions): IDisposable {
        const { type, content, delay } = options;

        message[type]({
            content,
            delay,
        });
        return toDisposable(() => {});
    }
}
