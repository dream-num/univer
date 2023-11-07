import { Direction } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { Observable, Subject } from 'rxjs';

export interface ISearchItem {
    name: string;
    desc: string;
}

export interface ISearchFunctionParams {
    /**
     * show SearchFunction Component or not
     */
    visible: boolean;

    /**
     * function search text
     */
    searchText: string;
}

export interface IHelpFunctionCommandParams {
    /**
     * show HelpFunction Component or not
     */
    visible: boolean;

    /**
     * function name
     */
    functionName: string;

    /**
     * function param index
     */
    paramIndex: number;
}

export interface INavigateParam {
    direction: Direction.UP | Direction.DOWN;
}

export interface IFormulaPromptService {
    /**
     * listen search function open
     */
    search$: Observable<ISearchFunctionParams>;

    /**
     * open search function
     */
    search(param: ISearchFunctionParams): void;

    /**
     * listen help function open
     */
    help$: Observable<IHelpFunctionCommandParams>;

    /**
     * open help function
     */

    help(param: IHelpFunctionCommandParams): void;

    /**
     * listen navigate shortcut, UP and DOWN
     */
    navigate$: Observable<INavigateParam>;

    /**
     * set navigate shortcut
     */
    navigate(param: INavigateParam): void;

    /**
     * listen accept shortcut, TAB/ENTER
     */
    accept$: Observable<boolean>;

    /**
     * set accept shortcut
     */
    accept(param: boolean): void;

    /**
     * accept formula name
     */
    acceptFormulaName$: Observable<string>;

    /**
     * set accept formula name
     */
    acceptFormulaName(param: string): void;

    dispose(): void;
}

export const IFormulaPromptService = createIdentifier<FormulaPromptService>('univer.formula-prompt-service');

export class FormulaPromptService implements IFormulaPromptService, IDisposable {
    private readonly _search$ = new Subject<ISearchFunctionParams>();

    private readonly _help$ = new Subject<IHelpFunctionCommandParams>();

    private readonly _navigate$ = new Subject<INavigateParam>();

    private readonly _accept$ = new Subject<boolean>();

    private readonly _acceptFormulaName$ = new Subject<string>();

    readonly search$ = this._search$.asObservable();

    readonly help$ = this._help$.asObservable();

    readonly navigate$ = this._navigate$.asObservable();

    readonly accept$ = this._accept$.asObservable();

    readonly acceptFormulaName$ = this._acceptFormulaName$.asObservable();

    dispose(): void {
        this._search$.complete();
        this._help$.complete();
        this._navigate$.complete();
        this._accept$.complete();
        this._acceptFormulaName$.complete();
    }

    search(param: ISearchFunctionParams) {
        this._search$.next(param);
    }

    help(param: IHelpFunctionCommandParams) {
        this._help$.next(param);
    }

    navigate(param: INavigateParam) {
        this._navigate$.next(param);
    }

    accept(param: boolean) {
        this._accept$.next(param);
    }

    acceptFormulaName(param: string) {
        this._acceptFormulaName$.next(param);
    }
}
