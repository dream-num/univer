import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

import { INotificationService } from './notification.service';

export class DesktopNotificationService implements INotificationService {
    show(): IDisposable {
        return toDisposable(() => {});
    }
}
