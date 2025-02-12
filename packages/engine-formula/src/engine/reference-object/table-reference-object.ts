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

import type { ISuperTable } from '../../basics/common';
import { TableOptionType } from '../../basics/common';
import { regexTestSuperTableColumn } from '../../basics/regex';

import { matchToken } from '../../basics/token';
import { BaseReferenceObject } from './base-reference-object';

// =Table2[[#Headers],[11111]:[Column3]]
// =Table2[[11111]:[222]]
// =Table2[222]
// =Table2[[#All],[222]:[Column4]]
export class TableReferenceObject extends BaseReferenceObject {
    constructor(
        token: string,
        private _tableData: ISuperTable,
        private _columnDataString: string,
        tableOptionMap: Map<string, TableOptionType>
    ) {
        super(token);
        const sheetId = this._tableData.sheetId;
        const range = this._tableData.range;
        const titleMap = this._tableData.titleMap;

        this.setForcedSheetIdDirect(sheetId);

        const columnData = this._stringToColumnData(this._columnDataString, titleMap, tableOptionMap);
        const startColumn = columnData.startColumn;
        const endColumn = columnData.endColumn;
        const type = columnData.type;
        let startRow = -1;
        let endRow = -1;

        const tableStartRow = range.startRow;

        const tableEndRow = range.startColumn;

        if (type === TableOptionType.ALL) {
            startRow = tableStartRow;
            endRow = tableEndRow;
        } else if (type === TableOptionType.DATA) {
            startRow = tableStartRow + 1;
            endRow = tableEndRow;
        } else if (type === TableOptionType.HEADERS) {
            startRow = tableStartRow;
            endRow = tableStartRow;
        } else if (type === TableOptionType.TOTALS) {
            startRow = tableEndRow;
            endRow = tableEndRow;
        }

        this.setRangeData({
            startColumn,
            endColumn,
            startRow,
            endRow,
        });
    }

    override isTable() {
        return true;
    }

    private _stringToColumnData(
        columnDataString: string,
        titleMap: Map<string, number>,
        tableOptionMap: Map<string, TableOptionType>
    ) {
        columnDataString = columnDataString.substring(1, -1);
        const commaIndex = columnDataString.indexOf(matchToken.COMMA);
        let startColumn = -1;
        let endColumn = -1;
        let type = TableOptionType.ALL;
        if (commaIndex === -1) {
            const data = this._columnHandler(columnDataString, titleMap);
            startColumn = data.startColumn;
            endColumn = data.endColumn;
        } else {
            // =Table2[[#Headers],[11111]:[Column3]]
            const rowString = columnDataString.substring(0, commaIndex).substring(1, -1);
            const columnString = columnDataString.substring(commaIndex + 1);

            const data = this._columnHandler(columnString, titleMap, true);
            startColumn = data.startColumn;
            endColumn = data.endColumn;

            type = tableOptionMap.get(rowString)!;
            if (!type) {
                type = TableOptionType.ALL;
            }
        }

        return {
            startColumn,
            endColumn,
            type,
        };
    }

    private _columnHandler(rightString: string, titleMap: Map<string, number>, isSingle = false) {
        let startColumn = -1;
        let endColumn = -1;
        const colonIndex = rightString.indexOf(matchToken.COLON);
        if (regexTestSuperTableColumn(rightString)) {
            // =Table2[[11111]:[222]]
            const startColumnString = rightString.substring(0, colonIndex).substring(1, -1);
            const endColumnString = rightString.substring(colonIndex + 1).substring(1, -1);
            startColumn = titleMap.get(startColumnString) ?? -1;
            endColumn = titleMap.get(endColumnString) ?? -1;
        } else {
            // =Table2[222]  =Table2[[222]]
            if (isSingle) {
                rightString = rightString.substring(1, -1);
            }
            startColumn = titleMap.get(rightString) ?? -1;
            endColumn = startColumn;
        }

        return {
            startColumn,
            endColumn,
        };
    }
}
