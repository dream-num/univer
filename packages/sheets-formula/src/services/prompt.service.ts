import type { Direction } from '@univerjs/core';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import type { ISearchItem } from './description.service';

export interface ISearchFunctionOperationParams {
    /**
     * show SearchFunction Component or not
     */
    visible: boolean;

    /**
     * function search text
     */
    searchText: string;

    /**
     * function list
     */
    searchList: ISearchItem[];
}

export interface IHelpFunctionOperationParams {
    /**
     * show HelpFunction Component or not
     */
    visible: boolean;

    /**
     * function param index
     */
    paramIndex: number;

    /**
     * function info
     */
    functionInfo: IFunctionInfo;
}

export interface INavigateParam {
    direction: Direction.UP | Direction.DOWN;
}

export interface IFormulaPromptService {
    /**
     * listen search function open
     */
    search$: Observable<ISearchFunctionOperationParams>;

    /**
     * open search function
     */
    search(param: ISearchFunctionOperationParams): void;

    /**
     * listen help function open
     */
    help$: Observable<IHelpFunctionOperationParams>;

    /**
     * open help function
     */

    help(param: IHelpFunctionOperationParams): void;

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

    isSearching(): boolean;

    isHelping(): boolean;

    dispose(): void;
}

export const IFormulaPromptService = createIdentifier<FormulaPromptService>('formula-ui.prompt-service');

export class FormulaPromptService implements IFormulaPromptService, IDisposable {
    private readonly _search$ = new Subject<ISearchFunctionOperationParams>();

    private readonly _help$ = new Subject<IHelpFunctionOperationParams>();

    private readonly _navigate$ = new Subject<INavigateParam>();

    private readonly _accept$ = new Subject<boolean>();

    private readonly _acceptFormulaName$ = new Subject<string>();

    readonly search$ = this._search$.asObservable();

    readonly help$ = this._help$.asObservable();

    readonly navigate$ = this._navigate$.asObservable();

    readonly accept$ = this._accept$.asObservable();

    readonly acceptFormulaName$ = this._acceptFormulaName$.asObservable();

    private _searching: boolean = false;

    private _helping: boolean = false;
    private _isInsertRefString: boolean = false;

    dispose(): void {
        this._search$.complete();
        this._help$.complete();
        this._navigate$.complete();
        this._accept$.complete();
        this._acceptFormulaName$.complete();
    }

    search(param: ISearchFunctionOperationParams) {
        this._searching = param.visible;
        this._search$.next(param);
    }

    isSearching() {
        return this._searching;
    }

    help(param: IHelpFunctionOperationParams) {
        this._helping = param.visible;
        this._help$.next(param);
    }

    isHelping() {
        return this._helping;
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
