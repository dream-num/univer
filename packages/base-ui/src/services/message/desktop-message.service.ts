import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

import { IMessageService } from './message.service';

export class DesktopMessageService implements IMessageService {
    show(): IDisposable {
        return toDisposable(() => {});
    }
}
