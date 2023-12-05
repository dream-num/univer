import { toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import { type IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';
import type { IConfirmService } from './confirm.service';

export class DesktopConfirmService implements IConfirmService {
    private _confirmOptions: IConfirmPartMethodOptions[] = [];
    readonly confirmOptions$ = new Subject<IConfirmPartMethodOptions[]>();

    open(option: IConfirmPartMethodOptions): IDisposable {
        if (this._confirmOptions.find((item) => item.id === option.id)) {
            this._confirmOptions = this._confirmOptions.map((item) => ({
                ...(item.id === option.id ? option : item),
                visible: true,
            }));
        } else {
            this._confirmOptions.push({
                ...option,
                visible: true,
            });
        }
        this.confirmOptions$.next(this._confirmOptions);

        return toDisposable(() => {
            this._confirmOptions = [];
            this.confirmOptions$.next([]);
        });
    }

    confirm(params: IConfirmPartMethodOptions): Promise<boolean> {
        return new Promise((resolve) => {
            const disposeHandler = this.open({
                ...params,
                onConfirm: () => {
                    disposeHandler.dispose();
                    resolve(true);
                },
                onClose: () => {
                    disposeHandler.dispose();
                    resolve(false);
                },
            });
        });
    }

    close(id: string): void {
        this._confirmOptions = this._confirmOptions.map((item) => ({
            ...item,
            visible: item.id === id ? false : item.visible,
        }));
        this.confirmOptions$.next([...this._confirmOptions]);
    }
}
