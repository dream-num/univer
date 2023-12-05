import { toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import { type ISidebarMethodOptions } from '../../views/components/sidebar/interface';
import type { ISidebarService } from './sidebar.service';

export class DesktopSidebarService implements ISidebarService {
    private _sidebarOptions: ISidebarMethodOptions = {};
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();

    open(params: ISidebarMethodOptions): IDisposable {
        this._sidebarOptions = {
            ...params,
            visible: true,
        };

        this.sidebarOptions$.next(this._sidebarOptions);

        return toDisposable(() => {
            this.sidebarOptions$.complete();
        });
    }

    set(params: ISidebarMethodOptions): void {
        this._sidebarOptions = {
            ...params,
        };

        this.sidebarOptions$.next(this._sidebarOptions);
    }

    close() {
        this._sidebarOptions = {
            ...this._sidebarOptions,
            visible: false,
        };

        this.sidebarOptions$.next(this._sidebarOptions);
        this._sidebarOptions.onClose && this._sidebarOptions.onClose();
    }
}
