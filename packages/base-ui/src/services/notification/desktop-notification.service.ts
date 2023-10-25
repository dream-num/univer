import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

import { INotificationMethodOptions, notification } from '../../Components/Notification/Notification';
import { INotificationService } from './notification.service';

export class DesktopNotificationService implements INotificationService {
    show(params: INotificationMethodOptions): IDisposable {
        notification.show(params);

        return toDisposable(() => {});
    }
}
