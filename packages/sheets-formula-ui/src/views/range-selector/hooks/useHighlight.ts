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

import type { ITextRun, Workbook } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ISequenceNode } from '@univerjs/engine-formula';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { INode } from './useFormulaToken';
import { ICommandService, IUniverInstanceService, ThemeService, useDependency } from '@univerjs/core';
import { ReplaceTextRunsCommand } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet, sequenceNodeType } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, setEndForRange } from '@univerjs/sheets';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { useCallback, useMemo } from 'react';
import { genFormulaRefSelectionStyle } from '../../../common/selection';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';

interface IRefSelection {
    refIndex: number;
    themeColor: string;
    token: string;
}

/**
 * @param {string} unitId
 * @param {string} subUnitId 打开面板的时候传入的 sheetId
 * @param {IRefSelection[]} refSelections
 */

export function useSheetHighlight(unitId: string) {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const themeService = useDependency(ThemeService);
    const refSelectionsService = useDependency(IRefSelectionsService);
    const renderManagerService = useDependency(IRenderManagerService);
    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const sheetSkeletonManagerService = render?.with(SheetSkeletonManagerService);

    const highlightSheet = useCallback((refSelections: IRefSelection[]) => {
        const workbook = univerInstanceService.getUnit<Workbook>(unitId);
        const worksheet = workbook?.getActiveSheet();
        const selectionWithStyle: ISelectionWithStyle[] = [];
        if (!workbook || !worksheet) {
            refSelectionsService.setSelections(selectionWithStyle);
            return;
        }
        const currentSheetId = worksheet.getSheetId();
        const getSheetIdByName = (name: string) => workbook?.getSheetBySheetName(name)?.getSheetId();

        const skeleton = sheetSkeletonManagerService?.getWorksheetSkeleton(currentSheetId)?.skeleton;
        if (!skeleton) return;

        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];
            const { themeColor, token, refIndex } = refSelection;

            const unitRangeName = deserializeRangeWithSheet(token);
            const { unitId: refUnitId, sheetName, range: rawRange } = unitRangeName;
            if (refUnitId && unitId !== refUnitId) {
                continue;
            }

            const refSheetId = getSheetIdByName(sheetName);

            if (refSheetId && refSheetId !== currentSheetId) {
                continue;
            }

            const range = setEndForRange(rawRange, worksheet.getRowCount(), worksheet.getColumnCount());
            selectionWithStyle.push({
                range,
                primary: null,
                style: genFormulaRefSelectionStyle(themeService, themeColor, refIndex.toString()),
            });
        }

        const allControls = refSelectionsRenderService?.getSelectionControls() || [];
        if (allControls.length === selectionWithStyle.length) {
            refSelectionsRenderService?.resetSelectionsByModelData(selectionWithStyle);
        } else {
            refSelectionsService.setSelections(selectionWithStyle);
        }
    }, [refSelectionsRenderService, refSelectionsService, sheetSkeletonManagerService, themeService, unitId, univerInstanceService]);
    return highlightSheet;
}

export function useDocHight(_leadingCharacter: string = '') {
    const descriptionService = useDependency(IDescriptionService);
    const colorMap = useColor();
    const commandService = useDependency(ICommandService);
    const leadingCharacterLength = useMemo(() => _leadingCharacter.length, [_leadingCharacter]);

    const highlightDoc = useCallback((editor: Editor, sequenceNodes: INode[], isNeedResetSelection = true, clearTextRun = true) => {
        const data = editor.getDocumentData();
        const editorId = editor.getEditorId();
        if (!data) {
            return [];
        }
        const body = data.body;
        if (!body) {
            return [];
        }
        const cloneBody = { dataStream: '', ...data.body };
        if (sequenceNodes == null || sequenceNodes.length === 0) {
            if (clearTextRun) {
                cloneBody.textRuns = [];
                // const cloneData = { ...data, body: cloneBody };
                // editor.setDocumentData(cloneData);
                commandService.syncExecuteCommand(ReplaceTextRunsCommand.id, {
                    unitId: editorId,
                    body: cloneBody,
                });
            }
            return [];
        } else {
            const { textRuns, refSelections } = buildTextRuns(descriptionService, colorMap, sequenceNodes);
            if (leadingCharacterLength) {
                textRuns.forEach((e) => {
                    e.ed = e.ed + leadingCharacterLength;
                    e.st = e.st + leadingCharacterLength;
                });
            }
            cloneBody.textRuns = textRuns;
            const text = sequenceNodes.reduce((pre, cur) => {
                if (typeof cur === 'string') {
                    return `${pre}${cur}`;
                }
                return `${pre}${cur.token}`;
            }, '');
            cloneBody.dataStream = `${_leadingCharacter}${text}\r\n`;
            let selections;
            if (isNeedResetSelection) {
                // Switching between uppercase and lowercase will trigger a reflow, causing the cursor to be misplaced. Let's refresh the cursor position here.
                selections = editor.getSelectionRanges();
                // After 'buildTextRuns' , the content changes, most of it is deleted, and the cursor position needs to be corrected
                const maxOffset = cloneBody.dataStream.length - 2 + leadingCharacterLength;
                selections.forEach((selection) => {
                    selection.startOffset = Math.max(0, Math.min(selection.startOffset, maxOffset));
                    selection.endOffset = Math.max(0, Math.min(selection.endOffset, maxOffset));
                });
            }

            // const cloneData = { ...data, body: cloneBody };
            // editor.setDocumentData(cloneData, selections);
            commandService.syncExecuteCommand(ReplaceTextRunsCommand.id, {
                unitId: editorId,
                body: cloneBody,
                textRanges: selections,
            });
            return refSelections;
        }
    }, [commandService, descriptionService, colorMap, leadingCharacterLength, _leadingCharacter]);
    return highlightDoc;
}

export function useColor() {
    const themeService = useDependency(ThemeService);
    const style = themeService.getCurrentTheme();
    const result = useMemo(() => {
        const formulaRefColors = [
            style.loopColor1,
            style.loopColor2,
            style.loopColor3,
            style.loopColor4,
            style.loopColor5,
            style.loopColor6,
            style.loopColor7,
            style.loopColor8,
            style.loopColor9,
            style.loopColor10,
            style.loopColor11,
            style.loopColor12,
        ];
        const numberColor = style.hyacinth700;
        const stringColor = style.verdancy800;
        return { formulaRefColors, numberColor, stringColor };
    }, [style]);
    return result;
}

export function buildTextRuns(descriptionService: IDescriptionService, colorMap: {
    formulaRefColors: string[];
    numberColor: string;
    stringColor: string;
}, sequenceNodes: Array<ISequenceNode | string>) {
    const { formulaRefColors, numberColor, stringColor } = colorMap;
    const textRuns: ITextRun[] = [];
    const refSelections: IRefSelection[] = [];
    const themeColorMap = new Map<string, string>();
    let refColorIndex = 0;

    for (let i = 0, len = sequenceNodes.length; i < len; i++) {
        const node = sequenceNodes[i];
        if (typeof node === 'string') {
            const theLastItem = textRuns[textRuns.length - 1];
            const start = theLastItem ? (theLastItem.ed) : 0;
            const end = start + node.length;
            textRuns.push({
                st: start,
                ed: end,
            });
            continue;
        }
        if (descriptionService.hasDefinedNameDescription(node.token.trim())) {
            continue;
        }
        const { startIndex, endIndex, nodeType, token } = node;
        let themeColor = '';
        if (nodeType === sequenceNodeType.REFERENCE) {
            if (themeColorMap.has(token)) {
                themeColor = themeColorMap.get(token)!;
            } else {
                const colorIndex = refColorIndex % formulaRefColors.length;
                themeColor = formulaRefColors[colorIndex];
                themeColorMap.set(token, themeColor);
                refColorIndex++;
            }

            refSelections.push({
                refIndex: i,
                themeColor,
                token,
            });
        } else if (nodeType === sequenceNodeType.NUMBER) {
            themeColor = numberColor;
        } else if (nodeType === sequenceNodeType.STRING) {
            themeColor = stringColor;
        } else if (nodeType === sequenceNodeType.ARRAY) {
            themeColor = stringColor;
        }

        if (themeColor && themeColor.length > 0) {
            textRuns.push({
                st: startIndex,
                ed: endIndex + 1,
                ts: {
                    cl: {
                        rgb: themeColor,
                    },
                },
            });
        }
    }

    return { textRuns, refSelections };
};
