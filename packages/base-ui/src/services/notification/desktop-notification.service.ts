import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

import { INotificationService, INotificationShowParams } from './notification.service';

export class DesktopNotificationService implements INotificationService {
    show(params: INotificationShowParams): IDisposable {
        window.alert(params.title);

        return toDisposable(() => {});
    }
}
