import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Subject } from 'rxjs';

import { type ISidebarMethodOptions } from '../../views/components/sidebar/interface';

export const ISidebarService = createIdentifier<ISidebarService>('univer.sidebar-service');

export interface ISidebarService {
    readonly sidebarOptions$: Subject<ISidebarMethodOptions>;

    open(params: ISidebarMethodOptions): IDisposable;

    set(params: ISidebarMethodOptions): void;

    close(): void;
}
