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

import type { ISheetHyperLinkInfo } from '@univerjs/sheets-hyper-link';
import { IDefinedNamesService, operatorToken } from '@univerjs/engine-formula';
import { SheetsHyperLinkParserService } from '@univerjs/sheets-hyper-link';
import { FWorkbook } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFWorkbookHyperlinkMixin {
    /**
     * Create a hyperlink url for the defined name.
     * The defined name must exist in the current workbook and must be a reference to a range, otherwise an error will be thrown.
     * @param {string} name - The name of the defined name.
     * @returns {string} The hyperlink url of the defined name.
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     *
     * // Create a defined name "TestRange" for the range A1:B10 of the active sheet
     * const definedNameParam = fWorkbook.newDefinedNameBuilder()
     *   .setName('TestRange')
     *   .setRef('Sheet1!$A$1:$B$10')
     *   .build();
     * fWorkbook.insertDefinedNameBuilder(definedNameParam);
     *
     * // Create a hyperlink to the defined name "TestRange" on cell C1
     * const url = fWorkbook.getUrlOfDefineName('TestRange');
     * console.log(url);
     * const fRange = fWorksheet.getRange('C1');
     * fRange.setHyperLink(url, 'Link to TestRange');
     *
     * // Create a hyperlink to the exiting defined name on cell C2
     * const definedNames = fWorkbook.getDefinedNames();
     * console.log(definedNames);
     * const exitsDefinedNameUrl = fWorkbook.getUrlOfDefineName(definedNames[0].getName());
     * console.log(exitsDefinedNameUrl);
     * const fRange2 = fWorksheet.getRange('C2');
     * fRange2.setHyperLink(exitsDefinedNameUrl, `Link to ${definedNames[0].getName()}`);
     * ```
     */
    getUrlOfDefineName(name: string): string;

    /**
     * Parse the hyperlink string to get the hyperlink info.
     * @param {string} hyperlink - The hyperlink string.
     * @returns {ISheetHyperLinkInfo} The hyperlink info.
     *
     * @example
     * ``` ts
     * // Create a hyperlink to the range A1:D10 of the current sheet
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const fRange = fWorksheet.getRange('A1:D10');
     * const hyperlink = fRange.getUrl();
     *
     * // Parse the hyperlink
     * const hyperlinkInfo = fWorkbook.parseSheetHyperlink(hyperlink);
     * console.log(hyperlinkInfo);
     * ```
     */
    parseSheetHyperlink(hyperlink: string): ISheetHyperLinkInfo;
}

export class FWorkbookHyperlinkMixin extends FWorkbook implements IFWorkbookHyperlinkMixin {
    override getUrlOfDefineName(name: string): string {
        const definedNameService = this._injector.get(IDefinedNamesService);
        const parserService = this._injector.get(SheetsHyperLinkParserService);

        const definedName = definedNameService.getValueByName(this._workbook.getUnitId(), name);
        if (!definedName) {
            throw new Error(`Defined name "${name}" does not exist.`);
        }

        if (definedName.formulaOrRefString.startsWith(operatorToken.EQUALS)) {
            throw new Error(`Defined name "${name}" is not a reference range, cannot be converted to hyperlink.`);
        }

        return parserService.buildHyperLink(definedName.id);
    }

    override parseSheetHyperlink(hyperlink: string): ISheetHyperLinkInfo {
        const parserService = this._injector.get(SheetsHyperLinkParserService);
        return parserService.parseHyperLink(hyperlink);
    }
}

FWorkbook.extend(FWorkbookHyperlinkMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookHyperlinkMixin { }
}
