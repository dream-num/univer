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
import { FWorkbook } from '@univerjs/sheets/facade';

interface IFWorkbookHyperlinkMixin {
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
    // TODO@weird94: this should be moved to hyperlink plugin
    parseSheetHyperlink(this: FWorkbook, hyperlink: string): ISheetHyperLinkInfo;
    /**
     * navigate to the sheet hyperlink
     * @param hyperlink the hyperlink string
     */
    navigateToSheetHyperlink(this: FWorkbook, hyperlink: string): void;
}

class FWorkbookHyperLinkMixin extends FWorkbook implements IFWorkbookHyperlinkMixin {
    override createSheetHyperlink(sheetId: string, range?: string | IRange): string {
        const resolverService = this._injector.get(SheetsHyperLinkResolverService);
        return resolverService.buildHyperLink(this.getId(), sheetId, range);
    }

    /**
     * parse the hyperlink string to get the hyperlink info
     * @param hyperlink the hyperlink string
     * @returns the hyperlink info
     */
    override parseSheetHyperlink(hyperlink: string): ISheetHyperLinkInfo {
        const resolverService = this._injector.get(SheetsHyperLinkResolverService);
        return resolverService.parseHyperLink(hyperlink);
    }

    override navigateToSheetHyperlink(hyperlink: string): void {
        const resolverService = this._injector.get(SheetsHyperLinkResolverService);
        const info = resolverService.parseHyperLink(hyperlink);
        info.handler();
    }
}

FWorkbook.extend(FWorkbookHyperLinkMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookHyperlinkMixin {}
}
