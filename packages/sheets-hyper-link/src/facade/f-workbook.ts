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

import type { ISheetHyperLinkInfo } from '@univerjs/sheets-hyper-link';
import type { FRange } from '@univerjs/sheets/facade';
import { Inject, type IRange } from '@univerjs/core';
import { SheetsHyperLinkParserService } from '@univerjs/sheets-hyper-link';
import { FWorkbook } from '@univerjs/sheets/facade';

export class SheetHyperLinkBuilder {
    constructor(
        private _workbook: FWorkbook,
        @Inject(SheetsHyperLinkParserService) private readonly _parserService: SheetsHyperLinkParserService
    ) {}

    getRangeUrl(range: FRange): this {
        this._parserService.buildHyperLink(this._workbook.getId(), range.getSheetId(), range.getRange());
        return this;
    }
}

export interface IFWorkbookHyperlinkMixin {
    /**
     * @deprecated use `getUrl` method in `FRange` or `FWorksheet` instead.
     */
    createSheetHyperlink(this: FWorkbook, sheetId: string, range?: string | IRange): string;

    /**
     * Parse the hyperlink string to get the hyperlink info.
     * @param hyperlink the hyperlink string
     * @returns the hyperlink info
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().parseSheetHyperlink('#gid=sheet_Id&range=F6')
     * ```
     */
    parseSheetHyperlink(this: FWorkbook, hyperlink: string): ISheetHyperLinkInfo;
}

export class FWorkbookHyperLinkMixin extends FWorkbook implements IFWorkbookHyperlinkMixin {
    override createSheetHyperlink(sheetId: string, range?: string | IRange): string {
        const parserService = this._injector.get(SheetsHyperLinkParserService);
        return parserService.buildHyperLink(this.getId(), sheetId, range);
    }

    /**
     * Parse the hyperlink string to get the hyperlink info.
     * @param {string} hyperlink the hyperlink string
     * @returns {ISheetHyperLinkInfo} the hyperlink info
     */
    override parseSheetHyperlink(hyperlink: string): ISheetHyperLinkInfo {
        const resolverService = this._injector.get(SheetsHyperLinkParserService);
        return resolverService.parseHyperLink(hyperlink);
    }
}

FWorkbook.extend(FWorkbookHyperLinkMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookHyperlinkMixin {}
}
