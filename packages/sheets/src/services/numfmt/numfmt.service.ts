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
import type { INumfmtService } from './type';

import {
    Disposable,
    ILogService,
    IResourceManagerService,
    IUniverInstanceService,
    Range,
} from '@univerjs/core';

export class NumfmtService extends Disposable implements INumfmtService {
    constructor(
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @ILogService private _logService: ILogService
    ) {
        super();
    }

    getValue(unitId: string, subUnitId: string, row: number, col: number) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            return;
        }
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }
        const styles = workbook.getStyles();
        const cell = worksheet.getCellRaw(row, col);
        if (cell?.s) {
            const style = styles.get(cell.s);
            if (style?.n) {
                return style.n;
            }
        }
        return null;
    }

    deleteValues(unitId: string, subUnitId: string, values: IRange[]) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            return;
        }
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }
        const styles = workbook.getStyles();

        values.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const cell = worksheet.getCellRaw(row, col);
                if (!cell) {
                    return;
                }
                const oldStyleId = cell?.s;
                const oldStyle = (oldStyleId && styles.get(oldStyleId)) || {};
                const newStyle = { ...oldStyle };
                delete newStyle.n;
                const newStyleId = styles.setValue(newStyle);
                cell.s = newStyleId;
            });
        });
    }

    setValues(
        unitId: string,
        subUnitId: string,
        values: Array<{ ranges: IRange[]; pattern: string }>
    ) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) {
            return;
        }
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }
        const styles = workbook.getStyles();
        const matrix = worksheet.getCellMatrix();

        values.forEach((value) => {
            value.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    const cell = worksheet.getCellRaw(row, col);
                    if (!cell) {
                        const style = { n: { pattern: value.pattern } };
                        const styleId = styles.setValue(style);
                        styleId && matrix.setValue(row, col, { s: styleId });
                    } else {
                        const oldStyle = styles.getStyleByCell(cell) || {};
                        const newStyle = { ...oldStyle, n: { pattern: value.pattern } };
                        const styleId = styles.setValue(newStyle);
                        cell.s = styleId;
                    }
                });
            });
        });
    }
}
