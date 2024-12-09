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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { FUniver, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { FPermission } from './f-permission';
import { FWorkbook } from './f-workbook';

export interface IFUniverSheetsMixin {
    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     *
     * @param {Partial<IWorkbookData>} data The snapshot of the spreadsheet.
     * @returns {FWorkbook} FWorkbook API instance.
     */
    createUniverSheet(data: Partial<IWorkbookData>): FWorkbook;
    /**
     * Get the currently focused Univer spreadsheet.
     *
     * @returns {FWorkbook | null} The currently focused Univer spreadsheet.
     */
    getActiveWorkbook(): FWorkbook | null;
    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     *
     * @param {string} id The spreadsheet id.
     * @returns {FWorkbook | null} The spreadsheet API instance.
     */
    getUniverSheet(id: string): FWorkbook | null;
    /**
     * Get the PermissionInstance.
     *
     * @returns {FPermission} - The PermissionInstance.
     */
    getPermission(): FPermission;
}

export class FUniverSheetsMixin extends FUniver implements IFUniverSheetsMixin {
    override createUniverSheet(data: Partial<IWorkbookData>): FWorkbook {
        const instanceService = this._injector.get(IUniverInstanceService);
        const workbook = instanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
        return this._injector.createInstance(FWorkbook, workbook);
    };

    override getActiveWorkbook(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getUniverSheet(id: string): FWorkbook | null {
        const workbook = this._univerInstanceService.getUnit<Workbook>(id, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getPermission(): FPermission {
        return this._injector.createInstance(FPermission);
    }
}

FUniver.extend(FUniverSheetsMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsMixin { }
}
