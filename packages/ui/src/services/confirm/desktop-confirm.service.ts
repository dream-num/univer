import { toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import { type IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';
import type { IConfirmService } from './confirm.service';

export class DesktopConfirmService implements IConfirmService {
    private confirmOptions: IConfirmPartMethodOptions[] = [];
    private readonly confirmOptions$ = new Subject<IConfirmPartMethodOptions[]>();

    open(option: IConfirmPartMethodOptions): IDisposable {
        if (this.confirmOptions.find((item) => item.id === option.id)) {
            this.confirmOptions = this.confirmOptions.map((item) => ({
                ...(item.id === option.id ? option : item),
                visible: true,
            }));
        } else {
            this.confirmOptions.push({
                ...option,
                visible: true,
            });
        }
        this.confirmOptions$.next(this.confirmOptions);

        return toDisposable(() => {
            this.confirmOptions = [];
            this.confirmOptions$.next([]);
        });
    }

    close(id: string): void {
        this.confirmOptions = this.confirmOptions.map((item) => ({
            ...item,
            visible: item.id === id ? false : item.visible,
        }));
        this.confirmOptions$.next([...this.confirmOptions]);
    }

    getObservableConfirm() {
        return this.confirmOptions$;
    }
}
