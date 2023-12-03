import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import { type ISidebarMethodOptions } from '../../views/components/sidebar/interface';
import { ISidebarService } from './sidebar.service';

export class DesktopSidebarService implements ISidebarService {
    private sidebarOptions: ISidebarMethodOptions = {};
    private readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();

    open(option: ISidebarMethodOptions): IDisposable {
        this.sidebarOptions = {
            ...option,
            visible: true,
        };

        this.sidebarOptions$.next(this.sidebarOptions);

        return toDisposable(() => {
            this.sidebarOptions$.next({});
        });
    }

    close() {
        this.sidebarOptions = {
            ...this.sidebarOptions,
            visible: false,
        };
        this.sidebarOptions$.next(this.sidebarOptions);
        this.sidebarOptions.onClose && this.sidebarOptions.onClose();
    }

    getObservableSidebar() {
        return this.sidebarOptions$;
    }
}
