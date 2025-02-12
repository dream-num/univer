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

import type { Injector, IRange, Workbook, Worksheet } from '@univerjs/core';
import type { IPermissionPanelRule } from '../../services/permission/sheet-permission-panel.model';
import { IUniverInstanceService, LocaleService, RANGE_TYPE, Rectangle, UniverInstanceType } from '@univerjs/core';
import { EditStateEnum, RangeProtectionRuleModel, SheetsSelectionsService, UnitObject, ViewStateEnum, WorksheetProtectionRuleModel } from '@univerjs/sheets';

export const checkRangeValid = (injector: Injector, permissionRanges: IRange[], permissionId: string, unitId: string, subUnitId: string) => {
    const localeService = injector.get(LocaleService);
    const worksheetRuleModel = injector.get(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = injector.get(RangeProtectionRuleModel);

    let rangeErrorString = '';
    if (permissionRanges.length === 0) {
        rangeErrorString = localeService.t('permission.panel.emptyRangeError');
    } else if (permissionRanges.length > 1) {
        let hasLap = false;
        for (let i = 0; i < permissionRanges.length; i++) {
            for (let j = i + 1; j < permissionRanges.length; j++) {
                if (Rectangle.intersects(permissionRanges[i], permissionRanges[j])) {
                    hasLap = true;
                    break;
                }
            }
            if (hasLap) {
                break;
            }
        }
        if (hasLap) {
            rangeErrorString = localeService.t('permission.panel.rangeOverlapError');
        }
    }
    if (!rangeErrorString) {
        const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
        if (worksheetRule && !permissionId) {
            rangeErrorString = localeService.t('permission.panel.rangeOverlapOverPermissionError');
            return rangeErrorString;
        }
        const lapRule = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
            return rule.permissionId !== permissionId;
        }).find((rule) => {
            return rule.ranges.some((ruleRange) => {
                return permissionRanges.some((r) => Rectangle.intersects(ruleRange, r));
            });
        });
        const lapRange = lapRule?.ranges.find((range) => {
            return permissionRanges.some((r) => Rectangle.intersects(range, r));
        });
        if (lapRange) {
            rangeErrorString = localeService.t('permission.panel.rangeOverlapOverPermissionError');
        }
    }
    return rangeErrorString === '' ? undefined : rangeErrorString;
};

export const checkRangesIsWholeSheet = (ranges: IRange[], sheet: Worksheet) => {
    if (ranges.length !== 1) {
        return false;
    }
    const range = ranges[0];
    const rowCount = sheet.getRowCount();
    const colCount = sheet.getColumnCount();

    const { startRow, endRow, startColumn, endColumn } = range;

    return startRow === 0 && startColumn === 0 && endRow === rowCount - 1 && endColumn === colCount - 1;
};

export const generateDefaultRule = (injector: Injector, fromSheetBar: boolean) => {
    const univerInstanceService = injector.get(IUniverInstanceService);
    const selectionManagerService = injector.get(SheetsSelectionsService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getActiveSheet();

    let unitType = UnitObject.SelectRange;
    let ranges = selectionManagerService.getCurrentSelections()?.map((s) => s.range) ?? [];

    if (fromSheetBar) {
        unitType = UnitObject.Worksheet;
        ranges = [{
            startRow: 0,
            startColumn: 0,
            endRow: worksheet.getRowCount() - 1,
            endColumn: worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ALL,
        }];
    }

    return {
        unitId: workbook.getUnitId(),
        subUnitId: worksheet.getSheetId(),
        permissionId: '',
        unitType,
        description: '',
        id: '',
        ranges,
        editState: EditStateEnum.OnlyMe,
        viewState: ViewStateEnum.OthersCanView,
    };
};

export const generateRuleByUnitType = (injector: Injector, rule: IPermissionPanelRule) => {
    const univerInstanceService = injector.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getActiveSheet();
    const { unitType } = rule;

    if (unitType === UnitObject.Worksheet) {
        return {
            ...rule,
            ranges: [{
                startRow: 0,
                startColumn: 0,
                endRow: worksheet.getRowCount() - 1,
                endColumn: worksheet.getColumnCount() - 1,
                rangeType: RANGE_TYPE.ALL,
            }],
        };
    }

    return rule;
};
