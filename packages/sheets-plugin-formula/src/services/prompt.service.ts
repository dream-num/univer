import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable, Subject } from 'rxjs';

export interface ISearchFunctionParams {
    /**
     * show SearchFunction Component or not
     */
    show: boolean;

    /**
     * function search result list
     */
    searchList: string[];
}

export interface IFormulaPromptService {
    search$: Observable<ISearchFunctionParams>;
    setSearch(param: ISearchFunctionParams): void;
    help$: Observable<boolean>;
    setHelp(param: boolean): void;
    dispose(): void;
}

export const IFormulaPromptService = createIdentifier<FormulaPromptService>('univer.formula-prompt-service');

export class FormulaPromptService implements IFormulaPromptService, IDisposable {
    private readonly _search$ = new Subject<ISearchFunctionParams>();

    private readonly _help$ = new Subject<boolean>();

    readonly search$ = this._search$.asObservable();

    readonly help$ = this._help$.asObservable();

    dispose(): void {
        this._search$.complete();
    }

    setSearch(param: ISearchFunctionParams) {
        this._search$.next(param);
    }

    setHelp(param: boolean) {
        this._help$.next(param);
    }
}
