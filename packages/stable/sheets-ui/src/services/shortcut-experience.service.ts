/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDisposable, ISelection, ITextRangeParam, Nullable } from '@univerjs/core';
import type { KeyCode } from '@univerjs/ui';
import { Inject, IUniverInstanceService, LocaleService } from '@univerjs/core';

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
 *
 */
export class ShortcutExperienceService implements IDisposable {
    private _current: Nullable<IShortcutExperienceSearch> = null;

    private _shortcutParam: IShortcutExperienceParam[] = [];

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        // empty
    }

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
