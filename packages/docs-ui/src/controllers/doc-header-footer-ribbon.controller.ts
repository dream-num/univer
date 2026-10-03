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
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, DocumentFlavor, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { IRibbonService } from '@univerjs/ui';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { DOC_HEADER_FOOTER_RIBBON_TAB } from '../views/header-footer/panel/component-name';

export class DocHeaderFooterRibbonController extends Disposable implements IRenderModule {
    private _visible = false;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) skeletonManager: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @IRibbonService private readonly _ribbonService: IRibbonService,
        @IRenderManagerService private readonly _renderManager: IRenderManagerService
    ) {
        super();
        this.disposeWithMe(combineLatest([
            skeletonManager.getViewModel().editAreaChange$,
            this._instanceService.focused$,
        ]).pipe(
            map(([area, focused]) => focused === this._context.unitId &&
                this._context.unit.getDocumentStyle().documentFlavor === DocumentFlavor.TRADITIONAL &&
                (area === DocumentEditArea.HEADER || area === DocumentEditArea.FOOTER)),
            distinctUntilChanged()
        ).subscribe((visible) => {
            if (visible === this._visible) {
                return;
            }
            this._visible = visible;
            if (visible) {
                this._ribbonService.showContextualTab(DOC_HEADER_FOOTER_RIBBON_TAB, { activate: true });
            } else if (!this._focusedDocumentEditsHeaderFooter()) {
                this._ribbonService.hideContextualTab(DOC_HEADER_FOOTER_RIBBON_TAB);
            }
        }));
    }

    private _focusedDocumentEditsHeaderFooter(): boolean {
        const focused = this._instanceService.getFocusedUnit();
        if (!focused || focused.type !== UniverInstanceType.UNIVER_DOC || focused.getUnitId() === this._context.unitId) {
            return false;
        }
        const manager = this._renderManager.getRenderUnitById(focused.getUnitId())?.with(DocSkeletonManagerService);
        const area = manager?.getViewModel().getEditArea();
        return (area === DocumentEditArea.HEADER || area === DocumentEditArea.FOOTER) &&
            manager?.getViewModel().getDataModel().getDocumentStyle().documentFlavor === DocumentFlavor.TRADITIONAL;
    }

    override dispose(): void {
        if (this._visible && !this._focusedDocumentEditsHeaderFooter()) {
            this._ribbonService.hideContextualTab(DOC_HEADER_FOOTER_RIBBON_TAB);
        }
        super.dispose();
    }
}
