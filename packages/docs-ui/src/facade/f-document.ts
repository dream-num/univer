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

import { DOC_RANGE_TYPE } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DocBackScrollRenderController, DocSelectionRenderService } from '@univerjs/docs-ui';
import { FDocument } from '@univerjs/docs/facade';
import { IRenderManagerService } from '@univerjs/engine-render';

interface IFDocumentUIMixin {
    setSelection(startOffset: number, endOffset: number): void;
}

export class FDocumentUIMixin extends FDocument implements IFDocumentUIMixin {
    /**
     * Sets the selection to a specified text range in the document.
     * A computed offscreen target is selected after its render data is loaded.
     * A newer pointer/selection action or changed text supersedes that request.
     * @param startOffset - The starting offset of the selection in the document.
     * @param endOffset - The ending offset of the selection in the document.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * fDocument.setSelection(10, 20);
     * ```
     */
    override setSelection(startOffset: number, endOffset: number): void {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderUnitById(this.getId());
        if (render == null) {
            return;
        }
        const docSelectionRenderService = render.with(DocSelectionRenderService);
        const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
        const pageIndex = skeleton.findBodyPageIndexByCharIndex(startOffset);
        const page = skeleton.getSkeletonData()?.pages[pageIndex];
        const segmentId = docSelectionRenderService.getSegment();
        if (segmentId === '' && page?.isMaterializationPlaceholder) {
            // Offscreen pages have offsets but no glyph nodes. Use the existing
            // bounded scroll/materialization path before rebuilding the selection.
            // Clear both caret and logical selection while that request is pending.
            const dataStream = this.getDocumentDataModel().getBody()?.dataStream;
            docSelectionRenderService.removeAllRanges();
            docSelectionRenderService.addDocRanges([], false, { shouldFocus: false });
            docSelectionRenderService.blur();
            render.with(DocBackScrollRenderController).scrollToRange({
                startOffset,
                endOffset,
                collapsed: startOffset === endOffset,
            }, () => {
                if (docSelectionRenderService.getSegment() !== segmentId ||
                    this.getDocumentDataModel().getBody()?.dataStream !== dataStream) {
                    return;
                }
                this.setSelection(startOffset, endOffset);
            });
            return;
        }
        docSelectionRenderService.removeAllRanges();
        docSelectionRenderService.addDocRanges(
            [
                {
                    startOffset,
                    endOffset,
                    rangeType: DOC_RANGE_TYPE.TEXT,
                },
            ],
            true
        );
    }
}

FDocument.extend(FDocumentUIMixin);
declare module '@univerjs/docs/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FDocument extends IFDocumentUIMixin {}
}
