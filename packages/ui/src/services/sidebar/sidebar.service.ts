import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { type Subject } from 'rxjs';

import { type ISidebarMethodOptions } from '../../views/components/sidebar/interface';

export const ISidebarService = createIdentifier<ISidebarService>('univer.sidebar-service');

export interface ISidebarService {
    open(params: ISidebarMethodOptions): IDisposable;

    close(): void;

    getObservableSidebar(): Subject<ISidebarMethodOptions>;
}
