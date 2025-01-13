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

import type { INumfmtLocalTag } from '@univerjs/core';
import { SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { FWorkbook } from '@univerjs/sheets/facade';

export interface IFWorkbookNumfmtMixin {
    // TODO@wzhudev: should separate numfmt package to two

    /**
     *  @example
     * ```ts
     * univerAPI.getActiveWorkbook().setNumfmtLocal('en')
     * ```
     * @param {INumfmtLocalTag} local
     * @returns {*}  {FWorkbook}
     * @memberof IFWorkbookNumfmtMixin
     */
    setNumfmtLocal(local: INumfmtLocalTag): FWorkbook;
}
export class FWorkbookLegacy extends FWorkbook implements IFWorkbookNumfmtMixin {
    override setNumfmtLocal(local: INumfmtLocalTag): FWorkbook {
        const sheetsNumfmtCellContentController = this._injector.get(SheetsNumfmtCellContentController);
        sheetsNumfmtCellContentController.setNumfmtLocal(local);
        return this;
    }
}
FWorkbook.extend(FWorkbookLegacy);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookNumfmtMixin { }
}
