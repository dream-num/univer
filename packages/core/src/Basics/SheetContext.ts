import { ContextBase } from './ContextBase';
import { Observable } from '../Observer';
import { GenName } from '../Shared';
import { ISpreadsheetConfig } from '../Types/Interfaces';
import { Spreadsheet } from '../Sheets/Domain/Spreadsheet';
import { CommandManager } from '../Command/CommandManager';
import { PropsFrom } from '../Shared/PropsFrom';
import { SpreadsheetObserver } from './SpreadsheetObserver';
import { SpreadsheetObserverImpl } from './SpreadsheetObserverImpl';

/**
 * Core context, mount important instances, managers
 */
export class SheetContext extends ContextBase {
    protected _spreadsheet: Spreadsheet;

    protected _genName: GenName;

    constructor(private snapshot: Partial<ISpreadsheetConfig> = {}, private commandManager: CommandManager) {
        super();
        this._setObserver();
        this._genName = new GenName();
        this._spreadsheet = new Spreadsheet(snapshot, this.commandManager);
    }

    getSpreadsheet(): Spreadsheet {
        return this._spreadsheet;
    }

    getGenName(): GenName {
        return this._genName;
    }

    getContextObserver<Key extends keyof SpreadsheetObserver>(value: Key): Observable<PropsFrom<SpreadsheetObserver[Key]>> {
        return this.getObserverManager().requiredObserver(value, 'core');
    }

    refreshSpreadsheet(univerSheetData: Partial<ISpreadsheetConfig> = {}) {
        this._spreadsheet = new Spreadsheet(univerSheetData, this.commandManager);
    }

    protected _setObserver(): void {
        const manager = this.getObserverManager();
        new SpreadsheetObserverImpl().install(manager);
    }

    protected _initialize(): void {
        // EMPTY Context Initialize
    }
}
