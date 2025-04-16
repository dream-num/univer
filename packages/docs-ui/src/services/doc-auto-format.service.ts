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

import type { DocumentDataModel, ICommandInfo, ICustomRange, IDisposable, IParagraphRange, Nullable } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { BuildTextUtils, Disposable, Inject, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';

export interface IAutoFormatContext {
    unit: DocumentDataModel;
    selection: ITextRangeWithStyle;
    /**
     * is selection at doc body
     */
    isBody: boolean;
    /**
     * selection relative paragraphs
     */
    paragraphs: IParagraphRange[];
    /**
     * selection relative custom ranges
     */
    customRanges: ICustomRange[];

    commandId: string;
    commandParams: Nullable<object>;
}

export interface IAutoFormat {
    id: string;
    match: (context: IAutoFormatContext) => boolean;
    getMutations: (context: IAutoFormatContext) => ICommandInfo[];
    priority?: number;
}

/**
 * service for auto-formatting, handle shortcut like `Space` or `Tab`.
 */
export class DocAutoFormatService extends Disposable {
    private _matches: Map<string, IAutoFormat[]> = new Map();
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService
    ) {
        super();
    }

    registerAutoFormat(match: IAutoFormat): IDisposable {
        const matchList = this._matches.get(match.id);
        if (matchList) {
            matchList.push(match);
            matchList.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
        } else {
            this._matches.set(match.id, [match]);
        }

        return toDisposable(() => {
            const matchList = this._matches.get(match.id);
            if (matchList) {
                const index = matchList.findIndex((i) => i === match);
                if (index >= 0) {
                    matchList.splice(index, 1);
                }
            }
        });
    }

    onAutoFormat(id: string, params: Nullable<object>): ICommandInfo[] {
        const autoFormats = this._matches.get(id) ?? [];
        const unit = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const docRanges = this._textSelectionManagerService.getDocRanges();
        const selection = docRanges.find((range) => range.isActive) ?? docRanges[0];

        if (unit && selection) {
            const doc = unit.getSelfOrHeaderFooterModel(selection.segmentId);
            const context: IAutoFormatContext = {
                unit: doc,
                selection,
                isBody: !selection.segmentId,
                paragraphs: BuildTextUtils.range.getParagraphsInRange(selection, doc.getBody()?.paragraphs ?? [], doc.getBody()?.dataStream ?? ''),
                customRanges: BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(selection, doc.getBody()?.customRanges ?? []),
                commandId: id,
                commandParams: params,
            };

            const matched = autoFormats.find((i) => i.match(context));
            return matched?.getMutations(context) ?? [];
        }

        return [];
    }
}
