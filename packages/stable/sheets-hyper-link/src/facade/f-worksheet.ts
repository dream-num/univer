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

import { SheetsHyperLinkParserService } from '@univerjs/sheets-hyper-link';
import { FWorksheet } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFWorksheetHyperlinkMixin {
    /**
     * Create a hyperlink url to this sheet
     * @returns {string} The url of this sheet
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const url = fWorksheet.getUrl();
     * console.log(url);
     * ```
     */
    getUrl(): string;
}

export class FWorksheetHyperlinkMixin extends FWorksheet implements IFWorksheetHyperlinkMixin {
    override getUrl(): string {
        const parserService = this._injector.get(SheetsHyperLinkParserService);
        return parserService.buildHyperLink(this._workbook.getUnitId(), this._worksheet.getSheetId());
    }
}

FWorksheet.extend(FWorksheetHyperlinkMixin);

declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetHyperlinkMixin {}
}
