import { toDisposable } from '@univerjs/core';
import { message } from '@univerjs/design';
import { IDisposable } from '@wendellhu/redi';

import { IMessageService, IShowOptions } from './message.service';

export class DesktopMessageService implements IMessageService {
    show(options: IShowOptions): IDisposable {
        const { type, ...rest } = options;

        message[type](rest);

        return toDisposable(() => {});
    }
}
