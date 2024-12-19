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

import type { IRange } from '@univerjs/core';
import type { ISheetHyperLinkInfo } from '@univerjs/sheets-hyper-link';
import { SheetsHyperLinkParserService } from '@univerjs/sheets-hyper-link';
import { FWorkbook } from '@univerjs/sheets/facade';

export interface IFWorkbookHyperlinkMixin {
    /**
     * create a hyperlink for the sheet
     * @param sheetId the sheet id to link
     * @param range the range to link, or define-name id
     * @returns the hyperlink string
     */
    createSheetHyperlink(this: FWorkbook, sheetId: string, range?: string | IRange): string;
    /**
     * parse the hyperlink string to get the hyperlink info
     * @param hyperlink the hyperlink string
     * @returns the hyperlink info
     */
    parseSheetHyperlink(this: FWorkbook, hyperlink: string): ISheetHyperLinkInfo;
}

export class FWorkbookHyperLinkMixin extends FWorkbook implements IFWorkbookHyperlinkMixin {
    override createSheetHyperlink(sheetId: string, range?: string | IRange): string {
        const parserService = this._injector.get(SheetsHyperLinkParserService);
        return parserService.buildHyperLink(this.getId(), sheetId, range);
    }

    /**
     * parse the hyperlink string to get the hyperlink info
     * @param hyperlink the hyperlink string
     * @returns the hyperlink info
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
