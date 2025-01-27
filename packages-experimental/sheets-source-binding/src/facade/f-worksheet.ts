/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellBindingNode, ICellBindingNodeParam } from '@univerjs/sheets-source-binding';
import { SheetsSourceBindService } from '@univerjs/sheets-source-binding';
import { FWorksheet } from '@univerjs/sheets/facade';

export interface IFworksheetSourceBindingMixin {
    /**
     * Set the binding node for the specified cell.
     * @param bindingNode The binding node to set. {@link ICellBindingNodeParam}
     */
    setBindingNode(bindingNode: ICellBindingNodeParam): void;
    /**
     * Remove the binding node for the specified cell.
     * @param {number} row The row index of the cell.
     * @param {number} column The column index of the cell.
     */
    removeBindingNode(row: number, column: number): void;
    /**
     * Get the binding node for the specified cell.
     * @param {number} row The row index of the cell.
     * @param {number} column The column index of the cell.
     * @returns The binding node of the cell. {@link ICellBindingNode} or undefined if not found.
     */
    getBindingNode(row: number, column: number): ICellBindingNode | undefined;
}

export class FWorksheetSourceBinding extends FWorksheet implements IFworksheetSourceBindingMixin {
    override setBindingNode(bindingNode: ICellBindingNodeParam): void {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        const unitId = this._workbook.getUnitId();
        sheetsSourceBindService.setBindingNode(unitId, this.getSheetId(), bindingNode);
    }

    override removeBindingNode(row: number, column: number): void {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        const unitId = this._workbook.getUnitId();
        sheetsSourceBindService.removeBindingNode(unitId, this.getSheetId(), row, column);
    }

    override getBindingNode(row: number, column: number): ICellBindingNode | undefined {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        const unitId = this._workbook.getUnitId();
        return sheetsSourceBindService.getBindingNode(unitId, this.getSheetId(), row, column);
    }
}

FWorksheet.extend(FWorksheetSourceBinding);

declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFworksheetSourceBindingMixin { }
}
