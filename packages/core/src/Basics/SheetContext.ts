import { Inject, Injector } from '@wendellhu/redi';

import { Workbook } from '../Sheets/Domain';
import { WorkBookObserverImpl } from './WorkBookObserverImpl';
import { ContextBase } from './ContextBase';
import { Observable } from '../Observer';
import { GenName, PropsFrom } from '../Shared';
import { Univer } from './Univer';
import { WorkBookObserver } from './WorkBookObserver';
import { IWorkbookConfig } from '../Types/Interfaces';

/**
 * Core context, mount important instances, managers
 */
export class SheetContext extends ContextBase {
    protected _workbook: Workbook;

    protected _genname: GenName;

    constructor(univerSheetData: Partial<IWorkbookConfig> = {}, @Inject(Injector) private readonly _sheetInjector: Injector) {
        super();
        this._workbook = this._sheetInjector.createInstance(Workbook, univerSheetData);
    }

    UNSAFE_setGenName(genName: GenName): void {
        this._genname = genName;
    }

    getWorkBook(): Workbook {
        return this._workbook;
    }

    getGenName(): GenName {
        return this._genname;
    }

    override onUniver(univer: Univer) {
        super.onUniver(univer);

        this._workbook.onUniver();
    }

    getContextObserver<Key extends keyof WorkBookObserver>(value: Key): Observable<PropsFrom<WorkBookObserver[Key]>> {
        return this.getObserverManager().requiredObserver(value, 'core');
    }

    TEMP_setObserver(): void {
        this._setObserver();
    }

    protected _setObserver(): void {
        const manager = this.getObserverManager();
        new WorkBookObserverImpl().install(manager);
    }

    protected override _initialize(): void {
        // EMPTY Context Initialize
    }
}