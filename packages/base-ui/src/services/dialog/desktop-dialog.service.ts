import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import { type IDialogPartMethodOptions } from '../../views/components/dialog-part/interface';
import { IDialogService } from './dialog.service';

export class DesktopDialogService implements IDialogService {
    private dialogOptions: IDialogPartMethodOptions[] = [];
    private readonly dialogOptions$ = new Subject<IDialogPartMethodOptions[]>();

    open(option: IDialogPartMethodOptions): IDisposable {
        if (this.dialogOptions.find((item) => item.id === option.id)) {
            this.dialogOptions = this.dialogOptions.map((item) => ({
                ...(item.id === option.id ? option : item),
                visible: true,
            }));
        } else {
            this.dialogOptions.push({
                ...option,
                visible: true,
            });
        }

        this.dialogOptions$.next(this.dialogOptions);

        return toDisposable(() => {
            this.dialogOptions = [];
            this.dialogOptions$.next([]);
        });
    }

    close(id: string) {
        this.dialogOptions = this.dialogOptions.map((item) => ({
            ...item,
            visible: item.id === id ? false : item.visible,
        }));
        this.dialogOptions$.next([...this.dialogOptions]);
    }

    getObservableDialog() {
        return this.dialogOptions$;
    }
}
