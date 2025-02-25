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
import { CustomRangeType, Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, Inject } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocEventManagerService } from '@univerjs/docs-ui';
import { ClickDocHyperLinkOperation, ToggleDocHyperLinkInfoPopupOperation } from '../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

export class DocHyperLinkEventRenderController extends Disposable implements IRenderModule {
    get _skeleton() {
        return this._docSkeletonManagerService.getSkeleton();
    }

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocEventManagerService) private readonly _docEventManagerService: DocEventManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocHyperLinkPopupService) private readonly _hyperLinkPopupService: DocHyperLinkPopupService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService
    ) {
        super();

        if (this._context.unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY || this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
            return;
        }

        this._initHover();
        this._initClick();
    }

    private _hideInfoPopup() {
        if (this._hyperLinkPopupService.showing) {
            this._commandService.executeCommand(
                ToggleDocHyperLinkInfoPopupOperation.id
            );
        }
    }

    private _initHover() {
        this.disposeWithMe(
            this._docEventManagerService.hoverCustomRanges$.subscribe((ranges) => {
                const link = ranges.find((range) => range.range.rangeType === CustomRangeType.HYPERLINK);
                const activeRanges = this._docSelectionManagerService.getTextRanges();
                const currentSegmentId = activeRanges?.[0].segmentId;
                if ((link?.segmentId ?? '') !== currentSegmentId) {
                    this._hideInfoPopup();
                    return;
                }

                if (link) {
                    this._commandService.executeCommand(
                        ToggleDocHyperLinkInfoPopupOperation.id,
                        {
                            unitId: this._context.unitId,
                            linkId: link.range.rangeId,
                            segmentId: link.segmentId,
                            segmentPage: link.segmentPageIndex,
                            rangeId: link.range.rangeId,
                            startIndex: link.range.startIndex,
                            endIndex: link.range.endIndex,
                        }
                    );
                } else {
                    this._hideInfoPopup();
                }
            })
        );
    }

    private _initClick() {
        this.disposeWithMe(
            this._docEventManagerService.clickCustomRanges$.subscribe((range) => {
                const link = range.range;
                if (link) {
                    this._commandService.executeCommand(
                        ClickDocHyperLinkOperation.id,
                        {
                            unitId: this._context.unitId,
                            linkId: link.rangeId,
                            segmentId: range.segmentId,
                        }
                    );
                }
            })
        );
    }
}
