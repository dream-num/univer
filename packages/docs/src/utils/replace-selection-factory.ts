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

import type { DocumentDataModel, IAccessor, IDocumentBody, IMutationInfo, ITextRangeParam, Nullable, TextX } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { BuildTextUtils, IUniverInstanceService, JSONX } from '@univerjs/core';
import { RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { DocSelectionManagerService } from '../services/doc-selection-manager.service';

export interface IReplaceSelectionFactoryParams {
    unitId: string;
    /**
     * selection to be replaced, if not provided, use the current selection.
     */
    selection?: ITextRangeParam;

    /** Body to be inserted at the given position. */
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    /**
     * Text ranges to be replaced.
     */
    textRanges?: ITextRangeWithStyle[];
    doc?: DocumentDataModel;
}

export function replaceSelectionFactory(accessor: IAccessor, params: IReplaceSelectionFactoryParams) {
    const { unitId, body: insertBody, doc } = params;
    let docDataModel: Nullable<DocumentDataModel> = doc;
    if (!docDataModel) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    }

    if (!docDataModel) {
        return false;
    }
    const segmentId = params.selection?.segmentId;
    const body = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

    if (!body) return false;

    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const selection = params.selection ?? docSelectionManagerService.getActiveTextRange();
    if (!selection || !body) {
        return false;
    }
    const textRanges = params.textRanges ?? [{
        startOffset: selection.startOffset + insertBody.dataStream.length,
        endOffset: selection.startOffset + insertBody.dataStream.length,
        collapsed: true,
        segmentId,
    }];

    const textX = BuildTextUtils.selection.replace({
        selection,
        body: insertBody,
        doc: docDataModel,
    });

    if (!textX) {
        return false;
    }

    const doMutation: IMutationInfo<IRichTextEditingMutationParams> & { textX: TextX } = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges,
            debounce: true,
            segmentId,
        },
        textX,
    };

    const jsonX = JSONX.getInstance();
    doMutation.params.actions = jsonX.editOp(textX.serialize());
    return doMutation;
}
