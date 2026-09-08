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

import { CustomRangeType } from '@univerjs/core';
import { DeleteDocHyperLinkCommand } from '../../../commands/commands/delete-link.command';
import { DocHyperLinkEventRenderController } from '../hyper-link-event.render-controller';

export class MobileDocHyperLinkEventRenderController extends DocHyperLinkEventRenderController {
    protected override _initHover(): void {}

    protected override _initPointerDown(): void {
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
}
