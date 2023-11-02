import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import { type IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';
import { IConfirmService } from './confirm.service';

export class DesktopConfirmService implements IConfirmService {
    private readonly confirm$ = new Subject<IConfirmPartMethodOptions>();

    open(options: IConfirmPartMethodOptions): IDisposable {
        this.confirm$.next(options);

        return toDisposable(() => {});
    }

    close() {
        this.confirm$.next({ visible: false });
    }

    getObservableConfirm() {
        return this.confirm$;
    }
}
