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

import type { DocumentDataModel } from '@univerjs/core';
import { CustomRangeType, Disposable, ICommandService, Inject } from '@univerjs/core';
import { DocEventManagerService } from '@univerjs/docs-ui';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { ClickDocHyperLinkOperation, ToggleDocHyperLinkInfoPopupOperation } from '../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

export class DocHyperLinkEventRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocEventManagerService) private readonly _docEventManagerService: DocEventManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocHyperLinkPopupService) private readonly _hyperLinkPopupService: DocHyperLinkPopupService
    ) {
        super();

        this._initHover();
        this._initClick();
    }

    private _initHover() {
        this.disposeWithMe(
            this._docEventManagerService.hoverCustomRanges$.subscribe((ranges) => {
                const link = ranges.find((range) => range.range.rangeType === CustomRangeType.HYPERLINK);
                if (link) {
                    const customRanges = this._context.unit.getSelfOrHeaderFooterModel(link.segmentId).getBody()?.customRanges ?? [];
                    const linkIndex = customRanges.findIndex((range) => range.rangeId === link.range.rangeId);
                    if (linkIndex !== -1) {
                        this._commandService.executeCommand(
                            ToggleDocHyperLinkInfoPopupOperation.id,
                            {
                                unitId: this._context.unitId,
                                linkId: link.range.rangeId,
                                segmentId: link.segmentId,
                                rangeIndex: linkIndex,
                                segmentPage: link.segmentPageIndex,
                            }
                        );
                    }
                } else if (this._hyperLinkPopupService.showing) {
                    this._commandService.executeCommand(
                        ToggleDocHyperLinkInfoPopupOperation.id
                    );
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
                        }
                    );
                }
            })
        );
    }
}
