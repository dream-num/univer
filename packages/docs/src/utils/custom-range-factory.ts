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

import type { CustomRangeType, DocumentDataModel, IAccessor, IAddCustomRangeTextXParam, IDocumentBody, IMutationInfo, ITextRange, ITextRangeParam, Nullable, TextX } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { BuildTextUtils, IUniverInstanceService, JSONX, UniverInstanceType } from '@univerjs/core';
import { RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { DocSelectionManagerService } from '../services/doc-selection-manager.service';

interface IAddCustomRangeParam extends IAddCustomRangeTextXParam {
    unitId: string;
}

/**
 * @deprecated This is a duplication from docs-ui to avoid making too much breaking changes.
 */
export function getRichTextEditPath(docDataModel: DocumentDataModel, segmentId = '') {
    if (!segmentId) {
        return ['body'];
    }

    const { headers, footers } = docDataModel.getSnapshot();

    if (headers == null && footers == null) {
        throw new Error('Document data model must have headers or footers when update by segment id');
    }

    if (headers?.[segmentId] != null) {
        return ['headers', segmentId, 'body'];
    } else if (footers?.[segmentId] != null) {
        return ['footers', segmentId, 'body'];
    } else {
        throw new Error('Segment id not found in headers or footers');
    }
}

export function addCustomRangeFactory(accessor: IAccessor, param: IAddCustomRangeParam, body: IDocumentBody) {
    const { unitId, segmentId } = param;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    if (!documentDataModel) {
        return false;
    }

    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId: param.unitId,
            actions: [],
            textRanges: undefined,
        },
    };
    const jsonX = JSONX.getInstance();
    const textX = BuildTextUtils.customRange.add({ ...param, body });
    if (!textX) {
        return false;
    }

    const path = getRichTextEditPath(documentDataModel, segmentId);
    doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
    return doMutation;
}

interface IAddCustomRangeFactoryParam {
    rangeId: string;
    rangeType: CustomRangeType;
    wholeEntity?: boolean;
    properties?: Record<string, any>;
    unitId: string;
    selections?: ITextRangeParam[];
}

export function addCustomRangeBySelectionFactory(accessor: IAccessor, param: IAddCustomRangeFactoryParam) {
    const { rangeId, rangeType, wholeEntity, properties, unitId, selections: propSelection } = param;
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selections = propSelection ?? docSelectionManagerService.getTextRanges({ unitId, subUnitId: unitId });
    const segmentId = selections?.[0]?.segmentId;
    if (!selections?.length) {
        return false;
    }

    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
    if (!documentDataModel) {
        return false;
    }
    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();
    if (!body) {
        return false;
    }

    const textX = BuildTextUtils.customRange.add({
        ranges: selections as ITextRange[],
        rangeId,
        rangeType,
        segmentId,
        wholeEntity,
        properties,
        body,
    });

    if (!textX) {
        return false;
    }
    const jsonX = JSONX.getInstance();
    const doMutation: IMutationInfo<IRichTextEditingMutationParams> & { textX: TextX } = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges: textX.selections,
            segmentId,
        },
        textX,
    };
    const path = getRichTextEditPath(documentDataModel, segmentId);
    doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
    return doMutation;
}

export interface IDeleteCustomRangeFactoryParams {
    rangeId: string;
    segmentId?: string;
    unitId: string;
    insert?: Nullable<IDocumentBody>;
}

export function deleteCustomRangeFactory(accessor: IAccessor, params: IDeleteCustomRangeFactoryParams) {
    const { unitId, segmentId, insert } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    if (!documentDataModel) {
        return false;
    }

    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId: params.unitId,
            actions: [],
            textRanges: undefined,
            segmentId,
        },
    };

    const jsonX = JSONX.getInstance();
    const textX = BuildTextUtils.customRange.delete({
        documentDataModel,
        rangeId: params.rangeId,
        insert,
        segmentId,
    });

    if (!textX) {
        return false;
    }

    const path = getRichTextEditPath(documentDataModel, segmentId);
    doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
    doMutation.params.textRanges = textX.selections;
    return doMutation;
}
