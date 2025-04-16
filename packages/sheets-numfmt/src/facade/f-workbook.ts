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

import type { INumfmtLocalTag } from '@univerjs/core';
import { SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { FWorkbook } from '@univerjs/sheets/facade';

export interface IFWorkbookNumfmtMixin {
    /**
     * Set the locale for number formatting.
     * @param {INumfmtLocalTag} local zh_CN,zh_TW,zh_HK,ja,ko,th,cs,da,nl,en,en_AU,en_CA,en_GB,en_IE,fi,fr,fr_CA,fr_CH,de,de_CH,el,hu,is,id,it,it_CH,nb,no,pl,pt,pt_BR,ru,sk,es,es_AR,es_BO,es_CL,es_CO,es_EC,es_MX,es_PY,es_UY,es_VE,sv,tr,cy,az,be,bg,ca,fil,gu,he,hr,hy,ka,kk,kn,lt,lv,ml,mn,mr,my,pa,ro,sl,sr,ta,te,uk,vi,ar,bn,hi
     * @returns {FWorkbook} The FWorkbook instance for chaining.
     * @memberof IFWorkbookNumfmtMixin
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1');
     * fRange.setValue(1234.567).setNumberFormat('#,##0.00');
     *
     * // Set the locale en_US for number formatting.
     * fWorkbook.setNumfmtLocal('en_US');
     * console.log(fRange.getDisplayValue()); // 1,234.57
     *
     * // Set the locale de_DE for number formatting.
     * fWorkbook.setNumfmtLocal('de_DE');
     * console.log(fRange.getDisplayValue()); // 1.234,57
     * ```
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
