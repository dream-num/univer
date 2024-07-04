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
import { CustomRangeType, Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, Tools, UniverInstanceType, updateAttributeByDelete } from '@univerjs/core';
import { TextSelectionManagerService } from '@univerjs/docs';
import { DocHyperLinkModel } from '@univerjs/docs-hyper-link';
import { IDocClipboardService } from '@univerjs/docs-ui';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Ready, DocHyperLinkClipboardController)
export class DocHyperLinkClipboardController extends Disposable {
    constructor(
        @Inject(IDocClipboardService) private readonly _docClipboardService: IDocClipboardService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocHyperLinkModel) private readonly _hyperLinkModel: DocHyperLinkModel,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();

        this._initClipboard();
    }

    private _initClipboard() {
        this.disposeWithMe(this._docClipboardService.addClipboardHook({
            onBeforePaste: (body) => {
                const doc = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
                if (!doc) {
                    return body;
                }
                const activeRange = this._textSelectionManagerService.getActiveRange();
                const customRanges = doc.getBody()?.customRanges;
                if (!customRanges?.length) {
                    return body;
                }
                const matchedRange = activeRange ?
                    customRanges.find(
                        (range) =>
                            range.rangeType === CustomRangeType.HYPERLINK &&
                            range.startIndex >= activeRange.startOffset &&
                            range.endIndex < activeRange.endOffset
                    )
                    : null;

                // insert into current link inside
                if (matchedRange) {
                    const { customRanges = [], ...extBody } = body;
                    const deleteRanges = customRanges.filter((range) => range.rangeType === CustomRangeType.HYPERLINK);
                    const deleteIndexes = deleteRanges.map((i) => [i.startIndex, i.endIndex]).flat().sort();
                    const bodyWithoutLink = {
                        ...extBody,
                        customRanges: customRanges.filter((range) => range.rangeType !== CustomRangeType.HYPERLINK),
                    };
                    for (let i = 0; i < deleteIndexes.length; i++) {
                        updateAttributeByDelete(bodyWithoutLink, 1, deleteIndexes[i] - i);
                    }
                    return bodyWithoutLink;
                } else {
                    const customRangeIds = new Set(customRanges.map((i) => i.rangeType === CustomRangeType.HYPERLINK && i.rangeId));
                    body.customRanges?.forEach((range) => {
                        if (range.rangeType === CustomRangeType.HYPERLINK && customRangeIds.has(range.rangeId)) {
                            const link = this._hyperLinkModel.getLink(doc.getUnitId(), range.rangeId);
                            if (link) {
                                const newId = Tools.generateRandomId();
                                this._hyperLinkModel.addLink(doc.getUnitId(), {
                                    payload: link.payload,
                                    id: newId,
                                });
                                range.rangeId = newId;
                            }
                        }
                    });
                }
                return body;
            },
        }));
    }
}
