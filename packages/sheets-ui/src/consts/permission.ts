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

import { UnitAction } from '@univerjs/protocol';
import type { LocaleKey } from '../locale/types';

export const UNIVER_SHEET_PERMISSION_PLUGIN_NAME = 'UNIVER_SHEET_PERMISSION_PLUGIN';
export const UNIVER_SHEET_PERMISSION_PANEL = 'UNIVER_SHEET_PERMISSION_PANEL';
export const UNIVER_SHEET_PERMISSION_USER_PART = 'UNIVER_SHEET_PERMISSION_USER_PART';
export const UNIVER_SHEET_PERMISSION_PANEL_FOOTER = 'UNIVER_SHEET_PERMISSION_PANEL_FOOTER';
export const UNIVER_SHEET_PERMISSION_USER_DIALOG = 'UNIVER_SHEET_PERMISSION_USER_DIALOG';
export const UNIVER_SHEET_PERMISSION_DIALOG = 'UNIVER_SHEET_PERMISSION_DIALOG';
export const UNIVER_SHEET_PERMISSION_USER_DIALOG_ID = 'UNIVER_SHEET_PERMISSION_USER_DIALOG_ID';
export const UNIVER_SHEET_PERMISSION_DIALOG_ID = 'UNIVER_SHEET_PERMISSION_DIALOG_ID';

export const subUnitPermissionTypeMap: Partial<Record<UnitAction, LocaleKey>> = {
    [UnitAction.Copy]: 'sheets-ui.permission.panel.Copy',
    [UnitAction.SetCellStyle]: 'sheets-ui.permission.panel.SetCellStyle',
    [UnitAction.SetCellValue]: 'sheets-ui.permission.panel.SetCellValue',
    [UnitAction.SetRowStyle]: 'sheets-ui.permission.panel.SetRowStyle',
    [UnitAction.SetColumnStyle]: 'sheets-ui.permission.panel.SetColumnStyle',
    [UnitAction.InsertRow]: 'sheets-ui.permission.panel.InsertRow',
    [UnitAction.InsertColumn]: 'sheets-ui.permission.panel.InsertColumn',
    [UnitAction.InsertHyperlink]: 'sheets-ui.permission.panel.InsertHyperlink',
    [UnitAction.DeleteRow]: 'sheets-ui.permission.panel.DeleteRow',
    [UnitAction.DeleteColumn]: 'sheets-ui.permission.panel.DeleteColumn',
    [UnitAction.Sort]: 'sheets-ui.permission.panel.Sort',
    [UnitAction.Filter]: 'sheets-ui.permission.panel.Filter',
    [UnitAction.PivotTable]: 'sheets-ui.permission.panel.PivotTable',
    [UnitAction.EditExtraObject]: 'sheets-ui.permission.panel.EditExtraObject',
};

export const defaultWorksheetUnitActionList: UnitAction[] = [
    UnitAction.Copy,
    UnitAction.SetCellStyle,
    UnitAction.SetCellValue,
    UnitAction.SetRowStyle,
    UnitAction.SetColumnStyle,
    UnitAction.InsertRow,
    UnitAction.InsertColumn,
    UnitAction.InsertHyperlink,
    UnitAction.DeleteRow,
    UnitAction.DeleteColumn,
    UnitAction.Sort,
    UnitAction.Filter,
    UnitAction.PivotTable,
    UnitAction.EditExtraObject,
    UnitAction.View,
];
