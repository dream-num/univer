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
import {
    CustomRangeType,
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    Inject,
} from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DocEventManagerService, DocMobileElementMenuService } from '@univerjs/docs-ui';
import { DeleteDocHyperLinkCommand } from '../../../commands/commands/delete-link.command';
import { ClickDocHyperLinkOperation } from '../../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../../services/hyper-link-popup.service';

export class MobileDocHyperLinkEventRenderController extends Disposable implements IRenderModule {
    get _skeleton() {
        return this._docSkeletonManagerService.getSkeleton();
    }

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocEventManagerService) private readonly _docEventManagerService: DocEventManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocHyperLinkPopupService) private readonly _hyperLinkPopupService: DocHyperLinkPopupService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocMobileElementMenuService) private readonly _mobileElementMenuService: DocMobileElementMenuService
    ) {
        super();

        if (this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
            return;
        }

        this._initPointerDown();
        this._initClick();
    }

    private _initPointerDown(): void {
        this.disposeWithMe(this._docEventManagerService.pointerDownCustomRanges$.subscribe((ranges) => {
            const link = ranges.find((range) => range.range.rangeType === CustomRangeType.HYPERLINK);
            if (!link) {
                this._hyperLinkPopupService.hideInfoPopupOnPointerDown();
                return;
            }

            const info = {
                unitId: this._context.unitId,
                linkId: link.range.rangeId,
                segmentId: link.segmentId,
                segmentPage: link.segmentPageIndex,
                startIndex: link.range.startIndex,
                endIndex: link.range.endIndex,
            };
            const rect = link.rects[0];
            if (rect && this._hyperLinkPopupService.canEditLink(info.unitId, info)) {
                this._mobileElementMenuService.capture({
                    unitId: info.unitId,
                    rect,
                    onEdit: () => this._hyperLinkPopupService.showEditPopup(info.unitId, info),
                    onDelete: () => this._commandService.executeCommand(DeleteDocHyperLinkCommand.id, info),
                });
            }
        }));
    }

    private _initClick(): void {
        this.disposeWithMe(
            this._docEventManagerService.clickCustomRanges$.subscribe((range) => {
                const link = range.range;
                if (link.rangeType !== CustomRangeType.HYPERLINK) {
                    return;
                }

                if (!range.ctrlKey && !range.metaKey) {
                    this._hyperLinkPopupService.showInfoPopup(
                        {
                            unitId: this._context.unitId,
                            linkId: link.rangeId,
                            segmentId: range.segmentId,
                            segmentPage: range.segmentPageIndex,
                            startIndex: link.startIndex,
                            endIndex: link.endIndex,
                        },
                        { pinned: true }
                    );
                    return;
                }

                this._commandService.executeCommand(
                    ClickDocHyperLinkOperation.id,
                    {
                        unitId: this._context.unitId,
                        linkId: link.rangeId,
                        segmentId: range.segmentId,
                    }
                );
            })
        );
    }
}
