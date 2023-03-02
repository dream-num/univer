import { Workbook } from '../Sheets/Domain';
import { WorkBookObserverImpl } from './WorkBookObserverImpl';
import { ContextBase } from './ContextBase';
import { Observable } from '../Observer';
import { GenName, PropsFrom } from '../Shared';
import { WorkBookObserver } from './WorkBookObserver';
import { IWorkbookConfig } from '../Interfaces';

/**
 * Core context, mount important instances, managers
 */
export class SheetContext extends ContextBase {
    protected _workbook: Workbook;

    protected _genname: GenName;

    constructor(univerSheetData: Partial<IWorkbookConfig> = {}) {
        super();
        this._setObserver();
        this._genname = new GenName();
        this._workbook = new Workbook(univerSheetData, this);
    }

    getWorkBook(): Workbook {
        return this._workbook;
    }

    getGenName(): GenName {
        return this._genname;
    }

    getContextObserver<Key extends keyof WorkBookObserver>(
        value: Key
    ): Observable<PropsFrom<WorkBookObserver[Key]>> {
        return this.getObserverManager().requiredObserver(value, 'core');
    }

    refreshWorkbook(univerSheetData: Partial<IWorkbookConfig> = {}) {
        this._workbook = new Workbook(univerSheetData, this);
    }

    protected _setObserver(): void {
        const manager = this.getObserverManager();
        new WorkBookObserverImpl().install(manager);
    }

    protected _initialize(): void {
        // EMPTY Context Initialize
    }
}
