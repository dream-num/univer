import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { Disposable } from '../../shared/lifecycle';

export interface IPermissionService {
    readonly editable$: Observable<boolean>;

    setEditable(editable: boolean): void;
}

export const IPermissionService = createIdentifier<IPermissionService>('univer.permission-service');

export class DesktopPermissionService extends Disposable implements IPermissionService {
    readonly editable$: Observable<boolean>;

    private readonly _editable$: BehaviorSubject<boolean>;

    constructor() {
        super();

        this._editable$ = new BehaviorSubject(true);
        this.editable$ = this._editable$.asObservable();
    }

    setEditable(editable: boolean): void {
        this._editable$.next(editable);
    }
}
