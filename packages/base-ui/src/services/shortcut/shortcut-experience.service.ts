import { ISelection, ITextRangeParam, IUniverInstanceService, LocaleService, Nullable } from '@univerjs/core';
import { IDisposable, Inject } from '@wendellhu/redi';

import { KeyCode } from './keycode';

export interface IShortcutExperienceSearch {
    unitId: string;
    sheetId: string;
    keycode: KeyCode;
}

export interface IShortcutExperienceParam extends IShortcutExperienceSearch {
    selection?: ISelection;
    textSelection?: ITextRangeParam;
}

/**
 * This service is prepared for shortcut experience optimization,
 * including the combined use of enter and tab, the highlighting experience of formulas in the editor, and so on.
 */
export class ShortcutExperienceService implements IDisposable {
    private _current: Nullable<IShortcutExperienceSearch> = null;

    private _shortcutParam: IShortcutExperienceParam[] = [];

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {}

    dispose(): void {
        this._shortcutParam = [];
    }

    getCurrentBySearch(searchParm: Nullable<IShortcutExperienceSearch>): Nullable<IShortcutExperienceParam> {
        return this._getCurrentBySearch(searchParm);
    }

    getCurrent(): Nullable<IShortcutExperienceParam> {
        return this._getCurrentBySearch(this._current);
    }

    addOrUpdate(insertParam: IShortcutExperienceParam): Nullable<IShortcutExperienceParam> {
        const param = this._getCurrentBySearch({
            unitId: insertParam.unitId,
            sheetId: insertParam.sheetId,
            keycode: insertParam.keycode,
        });

        if (param != null) {
            const index = this._shortcutParam.indexOf(param);
            this._shortcutParam.splice(index, 1);
        }

        this._shortcutParam.push(insertParam);

        return param;
    }

    remove(searchParm: Nullable<IShortcutExperienceSearch>): Nullable<IShortcutExperienceParam> {
        if (searchParm == null) {
            return;
        }
        const param = this._getCurrentBySearch(searchParm);
        if (param == null) {
            return;
        }
        const index = this._shortcutParam.indexOf(param);
        return this._shortcutParam.splice(index, 1)[0];
    }

    private _getCurrentBySearch(searchParm: Nullable<IShortcutExperienceSearch>): Nullable<IShortcutExperienceParam> {
        if (searchParm == null) {
            return;
        }
        const item = this._shortcutParam.find(
            (param) =>
                param.unitId === searchParm.unitId &&
                param.sheetId === searchParm.sheetId &&
                param.keycode === searchParm.keycode
        );

        return item;
    }
}
