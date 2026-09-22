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

import type { DocumentDataModel, ICommand, ICommandInfo, ICustomRange } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';
import {
    BuildTextUtils,
    CommandType,
    getRichTextEditPath,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    SHEET_EDITOR_UNITS,
    TextX,
    TextXActionType,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    getCustomDecorationAtPosition,
    getCustomRangeAtPosition,
    getTextRunAtInputPosition,
    getTextRunForSelection,
} from '../../basics/paragraph';
import { DocIMEInputManagerService } from '../../services/doc-ime-input-manager.service';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';
import { getEditorRuntimeConfig } from '../../services/editor/editor-runtime-config';
import { getDocRangeInsertOffset, getReplaceDocRangesActions } from './clipboard.inner.command';

export interface IIMEInputCommandParams {
    unitId: string;
    newText: string;
    oldTextLen: number;
    isCompositionStart: boolean;
    isCompositionEnd: boolean;
    isCompositionCanceled?: boolean;
}

export const IMEInputCommand: ICommand<IIMEInputCommandParams> = {
    id: 'doc.command.ime-input',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IIMEInputCommandParams) => {
        const { unitId, newText, oldTextLen, isCompositionEnd, isCompositionStart, isCompositionCanceled } = params;
        const commandService = accessor.get(ICommandService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docMenuStyleService = accessor.get(DocMenuStyleService);

        const imeInputManagerService = renderManagerService.getRenderUnitById(unitId)?.with(DocIMEInputManagerService);
        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

        if (docDataModel == null || imeInputManagerService == null) {
            return false;
        }

        const previousActiveRange = imeInputManagerService.getCompositionRange();
        if (previousActiveRange == null) {
            return false;
        }

        if (isCompositionCanceled) {
            const historyParams = imeInputManagerService.fetchComposedUndoRedoMutationParams();
            if (historyParams == null) {
                return true;
            }

            const {
                undoMutationParams,
                previousActiveRange,
                previousDocRanges,
                previousSelectionOptions,
            } = historyParams;
            const rollbackMutationParams: IRichTextEditingMutationParams = {
                ...undoMutationParams,
                textRanges: previousDocRanges.length ? previousDocRanges : [previousActiveRange],
                options: previousSelectionOptions ?? undefined,
                noHistory: true,
                trigger: IMEInputCommand.id,
            };

            return Boolean(commandService.syncExecuteCommand<
                IRichTextEditingMutationParams,
                IRichTextEditingMutationParams
            >(RichTextEditingMutation.id, rollbackMutationParams));
        }

        const { style, segmentId } = previousActiveRange;
        const body = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

        if (body == null) {
            return false;
        }

        const insertRange = previousActiveRange;
        Object.assign(previousActiveRange, insertRange);
        const { startOffset, endOffset } = previousActiveRange;
        const previousDocRanges = imeInputManagerService.getPreviousDocRanges();
        const previousRectRanges = previousDocRanges.filter(isRectRange);
        const previousTextRanges = previousDocRanges.filter((range) => !isRectRange(range));
        const wholeBodySelected = imeInputManagerService.getPreviousSelectionOptions()?.wholeDocument === true;
        const replacesComplexSelection = isCompositionStart && (wholeBodySelected || previousRectRanges.length > 0 || previousTextRanges.length > 1);
        let replacementOffset = replacesComplexSelection
            ? wholeBodySelected
                ? 0
                : getDocRangeInsertOffset(previousTextRanges, previousRectRanges)
            : startOffset;
        if (replacementOffset == null) {
            return false;
        }

        const len = newText.length;

        const textRanges: ITextRangeWithStyle[] = [
            {
                startOffset: replacementOffset + len,
                endOffset: replacementOffset + len,
                collapsed: true,
                style,
                segmentId,
            },
        ];

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                segmentId,
                trigger: IMEInputCommand.id,
            },
        };

        const defaultTextStyle = docMenuStyleService.getDefaultStyle();
        const styleCache = docMenuStyleService.getStyleCache();
        const styleOffset = replacesComplexSelection ? replacementOffset : startOffset + oldTextLen;
        let inheritedRanges: ICustomRange[];
        // The end caret is outside a whole-composition range. Preserve every
        // enclosing editable wrapper, including nested controls and links.
        if (!isCompositionStart && oldTextLen > 0) {
            inheritedRanges = body.customRanges?.filter((range) => !range.wholeEntity &&
                range.startIndex <= startOffset && range.endIndex >= startOffset + oldTextLen - 1) ?? [];
        } else {
            const range = getCustomRangeAtPosition(body.customRanges ?? [], styleOffset, SHEET_EDITOR_UNITS.includes(unitId));
            inheritedRanges = range ? [range] : [];
        }
        const curTextRun = isCompositionStart && !replacesComplexSelection
            ? getTextRunForSelection(body, { startOffset, endOffset }, defaultTextStyle, styleCache, SHEET_EDITOR_UNITS.includes(unitId), getEditorRuntimeConfig(docDataModel)?.inheritParagraphStartStyle === true)
            : getTextRunAtInputPosition(
                body,
                replacesComplexSelection ? replacementOffset : startOffset + oldTextLen,
                defaultTextStyle,
                styleCache,
                SHEET_EDITOR_UNITS.includes(unitId),
                getEditorRuntimeConfig(docDataModel)?.inheritParagraphStartStyle === true
            );

        const customDecorations = getCustomDecorationAtPosition(body.customDecorations ?? [], styleOffset);
        const insertBody = {
            dataStream: newText,
            textRuns: curTextRun
                ? [{
                    ...curTextRun,
                    st: 0,
                    ed: newText.length,
                }]
                : [],
            customRanges: inheritedRanges.map((range) => ({
                ...range,
                startIndex: 0,
                endIndex: newText.length - 1,
            })),
            customDecorations: customDecorations.map((customDecoration) => ({
                ...customDecoration,
                startIndex: 0,
                endIndex: newText.length - 1,
            })),
        };
        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        if (replacesComplexSelection) {
            const docSkeletonManagerService = renderManagerService.getRenderUnitById(unitId)?.with(DocSkeletonManagerService);
            if (!docSkeletonManagerService) {
                return false;
            }
            const replacement = getReplaceDocRangesActions(
                previousTextRanges,
                previousRectRanges,
                docDataModel,
                docSkeletonManagerService.getViewModel(),
                segmentId ?? '',
                insertBody,
                wholeBodySelected
            );
            if (!replacement) {
                return false;
            }
            replacementOffset = replacement.insertOffset;
            doMutation.params!.actions = replacement.actions;
            doMutation.params!.textRanges = [{
                startOffset: replacementOffset + len,
                endOffset: replacementOffset + len,
                collapsed: true,
                style,
                segmentId,
            }];
        } else if (!previousActiveRange.collapsed && isCompositionStart) {
            const dos = BuildTextUtils.selection.delete([previousActiveRange], body, 0, null, false);
            textX.push(...dos);
            doMutation.params!.textRanges = [{
                startOffset: replacementOffset + len,
                endOffset: replacementOffset + len,
                collapsed: true,
                segmentId,
            }];
        } else {
            textX.push({
                t: TextXActionType.RETAIN,
                len: startOffset,
            });
        }

        if (!replacesComplexSelection && oldTextLen > 0) {
            textX.push({
                t: TextXActionType.DELETE,
                len: oldTextLen,
            });
        }

        if (!replacesComplexSelection) {
            textX.push({
                t: TextXActionType.INSERT,
                body: insertBody,
                len: newText.length,
            });
        }

        if (!replacesComplexSelection) {
            const path = getRichTextEditPath(docDataModel, segmentId);
            doMutation.params!.actions = jsonX.editOp(textX.serialize(), path);
        }

        doMutation.params!.noHistory = !isCompositionEnd;

        doMutation.params!.isCompositionEnd = isCompositionEnd;

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        imeInputManagerService.pushUndoRedoMutationParams(result, doMutation.params!);
        if (replacesComplexSelection) {
            imeInputManagerService.setCompositionRange({
                ...previousActiveRange,
                startOffset: replacementOffset,
                endOffset: replacementOffset,
                collapsed: true,
            });
        }

        return Boolean(result);
    },
};

function isRectRange(range: ITextRangeWithStyle): range is IRectRangeWithStyle {
    return 'tableId' in range;
}
