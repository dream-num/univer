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

import type { ICellBindingNode } from '@univerjs/sheets-source-binding';
import { SheetsSourceBindService } from '@univerjs/sheets-source-binding';
import { FWorksheet } from '@univerjs/sheets/facade';

export interface IFworksheetSourceBindingMixin {
    setBindingNode(row: number, col: number, value: ICellBindingNode): void;
}

export class FWorksheetSourceBinding extends FWorksheet implements IFworksheetSourceBindingMixin {
    override setBindingNode(row: number, col: number, value: ICellBindingNode): void {
        const injector = this._injector;
        const sheetsSourceBindService = injector.get(SheetsSourceBindService);
        const unitId = this._workbook.getUnitId();
        sheetsSourceBindService.setBindingNode(unitId, this.getSheetId(), row, col, value);
    }
}

FWorksheet.extend(FWorksheetSourceBinding);

declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFworksheetSourceBindingMixin { }
}
