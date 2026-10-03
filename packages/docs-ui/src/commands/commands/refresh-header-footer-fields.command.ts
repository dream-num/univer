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

import type { DocumentDataModel, ICommand, ICustomRange, IDocumentBody, JSONXActions } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    CustomRangeType,
    DataStreamTreeTokenType,
    getRichTextEditPath,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    JSONX,
    LOCALE_META,
    LocaleService,
    TextX,
    UniverInstanceType,
} from '@univerjs/core';
import {
    canEditDocumentTargets,
    DocSelectionManagerService,
    DocStateChangeManagerService,
    getDocumentEditTargetObjectIds,
    RichTextEditingMutation,
    transformDocumentTextRanges,
} from '@univerjs/docs';
import { resolveDateTimeField } from '../../utils/date-time-field';

export const RefreshHeaderFooterFieldsCommand: ICommand<{ unitId: string; onOpen?: boolean; selectionOnly?: boolean }> = {
    id: 'doc.command.refresh-header-footer-fields',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const model = accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        const snapshot = model?.getSnapshot();
        if (!model || !snapshot || snapshot.disabled) {
            return false;
        }
        const permissions = accessor.get(IPermissionService);
        const locale = LOCALE_META[accessor.get(LocaleService).getCurrentLocale()].tag;
        const now = new Date();
        const selections = accessor.get(DocSelectionManagerService).getTextRanges({ unitId: params.unitId, subUnitId: params.unitId }) ?? [];
        let actions: JSONXActions = null;
        for (const [segmentId, segment] of Object.entries({ '': { body: snapshot.body }, ...snapshot.headers, ...snapshot.footers })) {
            if (!segment.body) {
                continue;
            }
            const textX = refreshDateTimeFields(segment.body, locale, now, (field) =>
                (!params.selectionOnly || selections.some((selection) => (selection.segmentId ?? '') === segmentId &&
                    selection.startOffset <= field.endIndex && selection.endOffset > field.startIndex)) && canEditDocumentTargets(
                    permissions,
                    params.unitId,
                    getDocumentEditTargetObjectIds(model, segmentId, { startOffset: field.startIndex, endOffset: field.endIndex + 1 })
                ));
            if (textX.length) {
                actions = JSONX.compose(actions, JSONX.getInstance().editOp(textX, getRichTextEditPath(model, segmentId)));
            }
        }
        if (JSONX.isNoop(actions)) {
            return true;
        }
        if (!params.onOpen) {
            accessor.get(DocStateChangeManagerService).flushPendingChanges(params.unitId);
        }
        return Boolean(accessor.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: params.unitId,
            actions,
            textRanges: transformDocumentTextRanges(actions, [...selections]),
            noHistory: params.onOpen === true,
            debounce: false,
            trigger: RefreshHeaderFooterFieldsCommand.id,
        }));
    },
};

export const UpdateSelectedDocFieldsCommand: ICommand = {
    id: 'doc.command.update-selected-fields',
    type: CommandType.COMMAND,
    handler(accessor) {
        const model = accessor.get(IUniverInstanceService).getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!model) {
            return false;
        }
        return accessor.get(ICommandService).syncExecuteCommand(RefreshHeaderFooterFieldsCommand.id, {
            unitId: model.getUnitId(),
            selectionOnly: true,
        });
    },
};

function refreshDateTimeFields(body: IDocumentBody, locale: string, date: Date, canEdit: (field: ICustomRange) => boolean) {
    const textX = new TextX();
    let cursor = 0;
    const ranges = [...body.customRanges ?? []].sort((a, b) => a.startIndex - b.startIndex);
    for (const field of ranges) {
        const properties = field.properties;
        if (field.rangeType !== CustomRangeType.FIELD || properties?.locked === BooleanNumber.TRUE ||
            (properties?.fieldType !== 'DATE' && properties?.fieldType !== 'TIME') || !canEdit(field) ||
            ranges.some((range) => range !== field && range.startIndex > field.startIndex && range.endIndex < field.endIndex)) {
            continue;
        }
        const start = field.startIndex;
        const run = body.textRuns?.find((run) => run.st <= start + 1 && run.ed > start + 1);
        const value = resolveDateTimeField(properties.instruction, run?.ts?.lang ?? locale, date);
        if (value == null || start < cursor || (body.dataStream.slice(start + 1, field.endIndex) === value && properties.cachedResult === value)) {
            continue;
        }
        const dataStream = `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${value}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`;
        textX.retain(start - cursor).delete(field.endIndex - start + 1).insert(dataStream.length, {
            dataStream,
            textRuns: run ? [{ ...run, st: 0, ed: dataStream.length }] : [],
            customRanges: [{ ...field, startIndex: 0, endIndex: dataStream.length - 1, properties: { ...properties, cachedResult: value } }],
        });
        cursor = field.endIndex + 1;
    }
    return textX.serialize();
}
