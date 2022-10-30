import { IRangeData } from '@univer/core';
import { ISuperTable, TableOptionType } from '../Basics/Common';
import { $SUPER_TABLE_COLUMN_REGEX } from '../Basics/Regex';
import { matchToken } from '../Basics/Token';
import { BaseReferenceObject } from './BaseReferenceObject';

// =Table2[[#Headers],[11111]:[Column3]]
// =Table2[[11111]:[222]]
// =Table2[222]
// =Table2[[#All],[222]:[Column4]]
export class TableReferenceObject extends BaseReferenceObject {
    private _stringToColumnData(columnDataString: string, titleMap: Map<string, number>, tableOptionMap: Map<string, TableOptionType>) {
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
        if ($SUPER_TABLE_COLUMN_REGEX.test(rightString)) {
            // =Table2[[11111]:[222]]
            const startColumnString = rightString.substring(0, colonIndex).substring(1, -1);
            const endColumnString = rightString.substring(colonIndex + 1).substring(1, -1);
            startColumn = titleMap[startColumnString];
            endColumn = titleMap[endColumnString];
        } else {
            // =Table2[222]  =Table2[[222]]
            if (isSingle) {
                rightString = rightString.substring(1, -1);
            }
            startColumn = titleMap[rightString];
            endColumn = startColumn;
        }

        return {
            startColumn,
            endColumn,
        };
    }

    constructor(token: string, private _tableData: ISuperTable, private _columnDataString: string, tableOptionMap: Map<string, TableOptionType>) {
        super(token);
        const sheetId = this._tableData.sheetId;
        const rangeData = this._tableData.rangeData;
        const titleMap = this._tableData.titleMap;

        this.setForcedSheetIdDirect(sheetId);

        const columnData = this._stringToColumnData(this._columnDataString, titleMap, tableOptionMap);
        const startColumn = columnData.startColumn;
        const endColumn = columnData.endColumn;
        const type = columnData.type;
        let startRow = -1;
        let endRow = -1;

        const tableStartRow = rangeData.startRow;

        const tableEndRow = rangeData.startColumn;

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

    isTable() {
        return true;
    }
}
