import { Disposable } from '@univerjs/core/Shared/lifecycle.js';
import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ISheetBarService {
    renameId$: Observable<string>;
    setRenameId(id: string): void;
}

export const ISheetBarService = createIdentifier<ISheetBarService>('univer.sheetbar-service');

export class SheetBarService extends Disposable implements ISheetBarService {
    readonly renameId$: Observable<string>;

    private readonly _renameId$: BehaviorSubject<string>;

    constructor() {
        super();

        this._renameId$ = new BehaviorSubject('');
        this.renameId$ = this._renameId$.asObservable();
    }

    setRenameId(renameId: string): void {
        this._renameId$.next(renameId);
    }
}
