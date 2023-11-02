import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import { type IDialogPartMethodOptions } from '../../views/components/dialog-part/interface';
import { IDialogService } from './dialog.service';

export class DesktopDialogService implements IDialogService {
    private readonly dialog$ = new Subject<IDialogPartMethodOptions>();

    open(options: IDialogPartMethodOptions): IDisposable {
        this.dialog$.next(options);

        return toDisposable(() => {});
    }

    close() {
        this.dialog$.next({ visible: false });
    }

    getObservableDialog() {
        return this.dialog$;
    }
}
