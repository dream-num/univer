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

import { DEFAULT_WORKSHEET, ICommandService, Tools, type Workbook } from '@univerjs/core';
import type { IInsertSheetCommandParams, ISetWorksheetActivateCommandParams } from '@univerjs/sheets';
import { InsertSheetCommand, SetWorksheetActivateCommand } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { FWorksheet } from './f-worksheet';

export class FWorkbook {
    constructor(
        private readonly _workbook: Workbook,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {}

    getActiveSheet(): FWorksheet | null {
        const activeSheet = this._workbook.getActiveSheet();
        if (!activeSheet) {
            return null;
        }

        return this._injector.createInstance(FWorksheet, this._workbook, activeSheet);
    }

    create(name: string, rows: number, column: number): FWorksheet {
        const newSheet = Tools.deepClone(DEFAULT_WORKSHEET);
        newSheet.rowCount = rows;
        newSheet.columnCount = column;
        newSheet.name = name;
        newSheet.id = name.toLowerCase().replace(/ /g, '-');

        this._commandService.syncExecuteCommand(InsertSheetCommand.id, {
            unitId: this._workbook.getUnitId(),
            index: this._workbook.getSheets().length,
            sheet: newSheet,
        } as IInsertSheetCommandParams);
        this._commandService.syncExecuteCommand(SetWorksheetActivateCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._workbook.getSheets()[this._workbook.getSheets().length - 1].getSheetId(),
        } as ISetWorksheetActivateCommandParams);

        return this._injector.createInstance(FWorksheet, this._workbook, this._workbook.getActiveSheet());
    }
}
