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
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { ISetTextSelectionsOperationParams } from '../commands/operations/text-selection.operation';
import { BuildTextUtils, Disposable, ICommandService, Inject, IUniverInstanceService } from '@univerjs/core';
import { SetTextSelectionsOperation } from '../commands/operations/text-selection.operation';
import { DocSelectionManagerService } from '../services/doc-selection-manager.service';

export class DocCustomRangeController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initSelectionChange();
    }

    private _transformCustomRange(doc: DocumentDataModel, selection: ITextRangeWithStyle) {
        const { startOffset, endOffset, collapsed } = selection;
        // find ranges intersect but not contain with selection
        const customRanges = doc.getCustomRanges()?.filter((range) => {
            if (!range.wholeEntity) {
                return false;
            }
            if (startOffset <= range.startIndex && endOffset > range.endIndex) {
                return false;
            }

            if (collapsed) {
                return range.startIndex < startOffset && range.endIndex >= endOffset;
            }
            return BuildTextUtils.range.isIntersects(startOffset, endOffset - 1, range.startIndex, range.endIndex);
        });

        if (customRanges?.length) {
            let start = startOffset;
            let end = endOffset;
            customRanges.forEach((range) => {
                start = Math.min(range.startIndex, start);
                end = Math.max(range.endIndex + 1, end);
            });

            return {
                ...selection,
                startOffset: start,
                endOffset: end,
                collapsed: start === end,
            };
        }

        return selection;
    }

    private _initSelectionChange() {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetTextSelectionsOperation.id) {
                const params = commandInfo.params as ISetTextSelectionsOperationParams;
                const { unitId, ranges, isEditing } = params;
                const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId);
                if (!doc) {
                    return;
                }
                const transformedRanges = ranges.map((range) => this._transformCustomRange(doc, range));
                if (transformedRanges.some((range, i) => ranges[i] !== range)) {
                    this._textSelectionManagerService.replaceTextRanges(transformedRanges, isEditing);
                }
            }
        }));
    }
}
