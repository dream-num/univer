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

import type { DocumentDataModel } from '@univerjs/core';
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { findTableOfContentsAtOffset } from '@univerjs/docs-toc';
import { IRibbonService } from '@univerjs/ui';
import { DOC_TABLE_OF_CONTENTS_RIBBON_TAB } from '../menu/schema';

export class TableOfContentsRibbonController extends Disposable {
    private _visible = false;

    constructor(
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @Inject(DocSelectionManagerService) private readonly _selectionManager: DocSelectionManagerService,
        @IRibbonService private readonly _ribbonService: IRibbonService
    ) {
        super();

        this.disposeWithMe(this._selectionManager.textSelection$.subscribe(() => this._update()));
        this.disposeWithMe(
            this._instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
                .subscribe(() => this._update())
        );
        this._update();
    }

    private _update(): void {
        const doc = this._instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const selection = this._selectionManager.getActiveTextRange();
        const visible = Boolean(
            doc &&
            selection &&
            !selection.segmentId &&
            findTableOfContentsAtOffset(doc.getBody(), selection.startOffset)
        );
        if (visible === this._visible) {
            return;
        }

        this._visible = visible;
        if (visible) {
            this._ribbonService.showContextualTab(DOC_TABLE_OF_CONTENTS_RIBBON_TAB, { activate: true });
        } else {
            this._ribbonService.hideContextualTab(DOC_TABLE_OF_CONTENTS_RIBBON_TAB);
        }
    }

    override dispose(): void {
        if (this._visible) {
            this._ribbonService.hideContextualTab(DOC_TABLE_OF_CONTENTS_RIBBON_TAB);
        }
        super.dispose();
    }
}
