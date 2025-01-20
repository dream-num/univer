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

import { SheetsHyperLinkParserService } from '@univerjs/sheets-hyper-link';
import { SheetsHyperLinkResolverService } from '@univerjs/sheets-hyper-link-ui';
import { FWorkbookHyperLinkMixin } from '@univerjs/sheets-hyper-link/facade';
import { FWorkbook } from '@univerjs/sheets/facade';

interface IFWorkbookHyperlinkUIMixin {
    /**
     * Navigate to the sheet hyperlink.
     * @param hyperlink the hyperlink string
     * @example
     * ``` ts
     * univerAPI.getActiveWorkbook().navigateToSheetHyperlink('#gid=sheet_Id&range=F6')
     * ```
     */
    navigateToSheetHyperlink(this: FWorkbook, hyperlink: string): void;
}

class FWorkbookHyperLinkUIMixin extends FWorkbookHyperLinkMixin implements IFWorkbookHyperlinkUIMixin {
    // TODO: this should be migrated back to hyperlink ui plugin
    override navigateToSheetHyperlink(hyperlink: string): void {
        const parserService = this._injector.get(SheetsHyperLinkParserService);
        const resolverService = this._injector.get(SheetsHyperLinkResolverService);
        const info = parserService.parseHyperLink(hyperlink);
        resolverService.navigate(info);
    }
}

FWorkbook.extend(FWorkbookHyperLinkUIMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookHyperlinkUIMixin {}
}
