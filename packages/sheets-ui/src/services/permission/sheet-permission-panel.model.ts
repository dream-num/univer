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

import type { IRange } from '@univerjs/core';
import { EditStateEnum, type IRangeProtectionRule, type IWorksheetProtectionRule, UnitObject, ViewStateEnum } from '@univerjs/sheets';

export const DEFAULT_RANGE_RULE: IRangeProtectionRule = {
    unitId: '',
    subUnitId: '',
    permissionId: '',
    unitType: UnitObject.SelectRange,
    id: '',
    ranges: [],
    viewState: ViewStateEnum.OthersCanView,
    editState: EditStateEnum.OnlyMe,
};

export type IPermissionPanelRule = (IRangeProtectionRule | IWorksheetProtectionRule) & { ranges: IRange[]; id: string };

export class SheetPermissionPanelModel {
    private _rule: IPermissionPanelRule = DEFAULT_RANGE_RULE;

    private _visible = false;

    setVisible(v: boolean) {
        this._visible = v;
    }

    getVisible() {
        return this._visible;
    }

    reset() {
        this.setVisible(false);
    }
}
