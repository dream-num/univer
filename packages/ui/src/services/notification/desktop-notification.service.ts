import { toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';

import type { INotificationMethodOptions } from '../../components/notification/Notification';
import { notification } from '../../components/notification/Notification';
import type { INotificationService } from './notification.service';

export class DesktopNotificationService implements INotificationService {
    show(params: INotificationMethodOptions): IDisposable {
        notification.show(params);

        return toDisposable(() => {});
    }
}
