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

import type { DocumentDataModel, ICommand, ITextRange } from '@univerjs/core';
import type { DateTimeFieldFormat } from '../../utils/date-time-field';
import {
    BooleanNumber,
    CommandType,
    CustomRangeType,
    DataStreamTreeTokenType,
    generateRandomId,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    LOCALE_META,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    canEditDocumentTargets,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    getDocumentEditTargetObjectIds,
    InsertTextCommand,
} from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getTextRunForSelection } from '../../basics/paragraph';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';
import { createDateTimeField } from '../../utils/date-time-field';

export interface IInsertHeaderFooterFieldParams {
    unitId: string;
    fieldType: 'PAGE' | 'NUMPAGES' | 'DATE' | 'TIME';
    selection?: ITextRange;
    segmentId?: string;
    segmentPage?: number;
    expectedDataStream?: string;
    format?: DateTimeFieldFormat;
    automatic?: boolean;
}

export const InsertHeaderFooterFieldCommand: ICommand<IInsertHeaderFooterFieldParams> = {
    id: 'doc.command.insert-header-footer-field',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params || !['PAGE', 'NUMPAGES', 'DATE', 'TIME'].includes(params.fieldType)) {
            return false;
        }
        const model = accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        const active = accessor.get(DocSelectionManagerService).getActiveTextRange();
        const selection = params.selection ?? active;
        const segmentId = params.segmentId ?? active?.segmentId;
        const snapshot = model?.getSnapshot();
        if (!model || snapshot?.disabled || !selection || !segmentId ||
            (!snapshot?.headers?.[segmentId] && !snapshot?.footers?.[segmentId])) {
            return false;
        }
        const body = model.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (!body || (params.expectedDataStream != null && params.expectedDataStream !== body.dataStream) ||
            !Number.isInteger(selection.startOffset) || !Number.isInteger(selection.endOffset) ||
            selection.startOffset < 0 || selection.endOffset < selection.startOffset || selection.endOffset > body.dataStream.length - 2) {
            return false;
        }
        if (!canEditDocumentTargets(accessor.get(IPermissionService), params.unitId, getDocumentEditTargetObjectIds(model, segmentId, selection))) {
            return false;
        }
        if (body.customRanges?.some((range) => range.rangeType === CustomRangeType.FIELD &&
            range.properties?.locked === BooleanNumber.TRUE && selection.startOffset <= range.endIndex &&
            selection.endOffset > range.startIndex)) {
            return false;
        }
        const locale = LOCALE_META[accessor.get(LocaleService).getCurrentLocale()].tag;
        let properties;
        if (params.fieldType === 'DATE' || params.fieldType === 'TIME') {
            const format = params.format ?? (params.fieldType === 'TIME' ? 'time' : 'short');
            if (!['short', 'long', 'time'].includes(format)) {
                return false;
            }
            properties = createDateTimeField(format, locale, new Date());
        } else {
            const skeleton = accessor.get(IRenderManagerService).getRenderUnitById(params.unitId)?.with(DocSkeletonManagerService).getSkeleton();
            const pages = skeleton?.getSkeletonData()?.pages;
            if (!pages?.length) {
                return false;
            }
            const pageIndex = params.segmentPage ?? active?.segmentPage ?? 0;
            const page = pages[Math.max(0, pageIndex)];
            if (!page) {
                return false;
            }
            properties = {
                fieldType: params.fieldType,
                instruction: params.fieldType,
                cachedResult: String(params.fieldType === 'PAGE' ? page.pageNumber : skeleton?.getCompletedPageCount() ?? '…'),
            };
        }
        const automatic = params.automatic !== false || params.fieldType === 'PAGE' || params.fieldType === 'NUMPAGES';
        const dataStream = automatic
            ? `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${properties.cachedResult}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`
            : properties.cachedResult;
        const style = accessor.get(DocMenuStyleService);
        const textRun = getTextRunForSelection(body, selection, style.getDefaultStyle(), style.getStyleCache(), false);
        return accessor.get(ICommandService).syncExecuteCommand(InsertTextCommand.id, {
            unitId: params.unitId,
            segmentId,
            range: selection,
            debounce: false,
            body: {
                dataStream,
                textRuns: [{ ...textRun, ts: { ...textRun.ts, lang: locale }, st: 0, ed: dataStream.length }],
                customRanges: automatic
                    ? [{
                        startIndex: 0,
                        endIndex: dataStream.length - 1,
                        rangeId: generateRandomId(),
                        rangeType: CustomRangeType.FIELD,
                        wholeEntity: false,
                        properties: { ...properties, sourceKind: 'complex' },
                    }]
                    : [],
            },
            textRanges: [{
                ...selection,
                segmentId,
                segmentPage: params.segmentPage ?? active?.segmentPage,
                startOffset: selection.startOffset + dataStream.length,
                endOffset: selection.startOffset + dataStream.length,
                collapsed: true,
            }],
        });
    },
};
