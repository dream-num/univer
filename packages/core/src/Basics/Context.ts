import { IUniverData } from '../Types/Interfaces/IUniverData';
import { Locale } from '../Shared/Locale';
import { Tools } from '../Shared/Tools';
import { ContextBase } from './ContextBase';
import { CommandManager } from '../Command/CommandManager';

/**
 * univer context
 */
export class Context extends ContextBase {
    protected _commandManager: CommandManager;

    protected _locale: Locale;

    private _univerId: string;

    constructor(univerData: Partial<IUniverData> = {}) {
        super();

        this._initialize();

        this._locale = new Locale();

        // Initialize internationalization
        this._locale.initialize(univerData.locale);

        if (univerData.id == null || univerData.id.length === 0) {
            this._univerId = Tools.generateRandomId(10);
        } else {
            this._univerId = univerData.id;
        }
    }

    getCommandManger() {
        return this._commandManager;
    }

    getLocale(): Locale {
        return this._locale;
    }

    getUniverId() {
        return this._univerId;
    }

    protected _initialize(): void {
        this._commandManager = new CommandManager();
    }

    protected _setObserver(): void {}
}
