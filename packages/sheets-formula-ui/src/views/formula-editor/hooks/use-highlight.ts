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

import type { IDocumentBody, IRange, ITextRange, ITextRun, Workbook } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ISequenceNode } from '@univerjs/engine-formula';
import type { ISelectionWithStyle, SheetsSelectionsService } from '@univerjs/sheets';
import type { INode } from './use-formula-token';
import { ICommandService, IUniverInstanceService, ThemeService, UniverInstanceType } from '@univerjs/core';
import { ReplaceTextRunsCommand } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet, sequenceNodeType } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, setEndForRange } from '@univerjs/sheets';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { useDependency, useEvent } from '@univerjs/ui';
import { useEffect, useMemo } from 'react';
import { genFormulaRefSelectionStyle } from '../../../common/selection';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render.service';

export interface IRefSelection {
    refIndex: number;
    themeColor: string;
    token: string;
    startIndex: number;
    endIndex: number;
    index: number;
}

function isSameSelectionRange(left: IRange | undefined, right: IRange): boolean {
    return !!left &&
        left.startRow === right.startRow &&
        left.startColumn === right.startColumn &&
        left.endRow === right.endRow &&
        left.endColumn === right.endColumn &&
        (!left.sheetId || !right.sheetId || left.sheetId === right.sheetId) &&
        (!left.unitId || !right.unitId || left.unitId === right.unitId);
}

// eslint-disable-next-line complexity, max-lines-per-function
export function calcHighlightRanges(opts: {
    unitId: string;
    subUnitId: string;
    currentWorkbook: Workbook;
    refSelections: IRefSelection[];
    editor: Editor | undefined;
    refSelectionsService: SheetsSelectionsService;
    refSelectionsRenderService: RefSelectionsRenderService | undefined;
    sheetSkeletonManagerService: SheetSkeletonManagerService | undefined;
    themeService: ThemeService;
    univerInstanceService: IUniverInstanceService;
}) {
    const {
        unitId,
        subUnitId,
        currentWorkbook,
        refSelections,
        editor,
        refSelectionsService,
        refSelectionsRenderService,
        sheetSkeletonManagerService,
        themeService,
        univerInstanceService,
    } = opts;
    const currentUnitId = currentWorkbook.getUnitId();
    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    const worksheet = workbook?.getActiveSheet();
    const selectionWithStyle: ISelectionWithStyle[] = [];
    if (!workbook || !worksheet) {
        return selectionWithStyle;
    }
    const currentSheetId = worksheet.getSheetId();
    const getSheetIdByName = (name: string) => workbook?.getSheetBySheetName(name)?.getSheetId();

    const skeleton = sheetSkeletonManagerService?.getSkeleton(currentSheetId);
    if (!skeleton) return;
    const endIndexes: number[] = [];
    const currentSelections = refSelectionsService.getCurrentSelections();
    const matchedCurrentSelectionIndexes = new Set<number>();
    const getPrimaryForRange = (range: IRange, fallbackIndex: number) => {
        const currentSelection = currentSelections[fallbackIndex];
        if (isSameSelectionRange(currentSelection?.range, range)) {
            matchedCurrentSelectionIndexes.add(fallbackIndex);
            return currentSelection.primary;
        }

        const matchedIndex = currentSelections.findIndex((selection, index) =>
            !matchedCurrentSelectionIndexes.has(index) && isSameSelectionRange(selection.range, range)
        );
        if (matchedIndex !== -1) {
            matchedCurrentSelectionIndexes.add(matchedIndex);
            return currentSelections[matchedIndex].primary;
        }

        return undefined;
    };
    for (let i = 0, len = refSelections.length; i < len; i++) {
        const refSelection = refSelections[i];
        const { themeColor, token, refIndex, endIndex } = refSelection;

        const unitRangeName = deserializeRangeWithSheet(token);
        const { unitId: refUnitId, sheetName, range: rawRange } = unitRangeName;
        const refSheetId = getSheetIdByName(sheetName);

        if (!refSheetId && sheetName) {
            continue;
        }

        if (currentUnitId !== unitId && refUnitId !== currentUnitId) {
            continue;
        }

        if (refUnitId && refUnitId !== currentUnitId) {
            continue;
        }

        if ((refSheetId && refSheetId !== currentSheetId) || (!refSheetId && currentSheetId !== subUnitId)) {
            continue;
        }

        const range = setEndForRange(rawRange, worksheet.getRowCount(), worksheet.getColumnCount());
        range.unitId = unitId;
        range.sheetId = currentSheetId;
        selectionWithStyle.push({
            range,
            primary: getPrimaryForRange(range, selectionWithStyle.length),
            style: genFormulaRefSelectionStyle(themeService, themeColor, refIndex.toString()),
        });
        endIndexes.push(endIndex);
    }

    if (editor) {
        const cursor = editor.getSelectionRanges()?.[0]?.startOffset;
        const activeIndex = endIndexes.findIndex((end) => end + 2 === cursor);
        if (activeIndex !== -1) {
            refSelectionsRenderService?.setActiveSelectionIndex(activeIndex);
        } else if (selectionWithStyle.length) {
            refSelectionsRenderService?.setActiveSelectionIndex(selectionWithStyle.length - 1);
        } else {
            refSelectionsRenderService?.resetActiveSelectionIndex();
        }
    }

    return selectionWithStyle;
}

/**
 * @param {string} unitId
 * @param {string} subUnitId 打开面板的时候传入的 sheetId
 * @param {IRefSelection[]} refSelections
 */

export function useSheetHighlight(unitId: string, subUnitId: string) {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const themeService = useDependency(ThemeService);
    const refSelectionsService = useDependency(IRefSelectionsService);
    const renderManagerService = useDependency(IRenderManagerService);
    const ownerRender = renderManagerService.getRenderById(unitId);
    const ownerRefSelectionsRenderService = ownerRender?.with(RefSelectionsRenderService);

    const getHighlightWorkbook = useEvent((refSelections: IRefSelection[]) => {
        const ownerWorkbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        const currentWorkbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const currentUnitId = currentWorkbook?.getUnitId();
        const hasExplicitCurrentWorkbookRef = Boolean(currentUnitId) && refSelections.some((refSelection) =>
            deserializeRangeWithSheet(refSelection.token).unitId === currentUnitId
        );

        return hasExplicitCurrentWorkbookRef ? currentWorkbook : ownerWorkbook ?? currentWorkbook;
    });

    const highlightSheet = useEvent((refSelections: IRefSelection[], editor?: Editor, isEnd = false) => {
        const currentWorkbook = getHighlightWorkbook(refSelections);
        if (!currentWorkbook) return;
        const currentRender = renderManagerService.getRenderById(currentWorkbook.getUnitId());
        const refSelectionsRenderService = currentRender?.with(RefSelectionsRenderService);
        const sheetSelectionRenderService = currentRender?.with(ISheetSelectionRenderService);
        const sheetSkeletonManagerService = currentRender?.with(SheetSkeletonManagerService);
        if (!isEnd && refSelectionsRenderService?.selectionMoving) return;
        const currentSheetId = currentWorkbook.getActiveSheet()?.getSheetId();
        if (!currentSheetId) return;
        const selectionWithStyle = calcHighlightRanges({
            unitId,
            subUnitId,
            currentWorkbook,
            refSelections,
            editor,
            refSelectionsService,
            refSelectionsRenderService,
            sheetSkeletonManagerService,
            themeService,
            univerInstanceService,
        });

        if (!selectionWithStyle) return;
        const allControls = refSelectionsRenderService?.getSelectionControls() || [];
        // If the number are same, try to reuse the current controls
        if (allControls.length === selectionWithStyle.length) {
            refSelectionsRenderService?.resetSelectionsByModelData(selectionWithStyle);
        } else {
            refSelectionsService.setSelections(currentWorkbook.getUnitId(), currentSheetId, selectionWithStyle);
        }
        if (isEnd && selectionWithStyle.length) {
            sheetSelectionRenderService?.resetSelectionsByModelData([]);
        }
    });

    useEffect(() => {
        return () => {
            ownerRefSelectionsRenderService?.resetActiveSelectionIndex();
        };
    }, [ownerRefSelectionsRenderService]);

    return highlightSheet;
}

export function useDocHight(_leadingCharacter: string = '') {
    const descriptionService = useDependency(IDescriptionService);
    const colorMap = useColor();
    const commandService = useDependency(ICommandService);
    const leadingCharacterLength = useMemo(() => _leadingCharacter.length, [_leadingCharacter]);

    const highlightDoc = useEvent((
        editor: Editor,
        sequenceNodes: INode[],
        isNeedResetSelection = true,
        newSelections?: ITextRange[],
        sourceText?: string
    ) => {
        const data = editor.getDocumentData();
        const editorId = editor.getEditorId();
        if (!data) {
            return [];
        }
        const body = data.body;
        if (!body) {
            return [];
        }
        const str = body.dataStream.slice(0, body.dataStream.length - 2);
        if (!str.startsWith(_leadingCharacter)) return [];
        if (sequenceNodes == null || sequenceNodes.length === 0) {
            commandService.syncExecuteCommand(ReplaceTextRunsCommand.id, {
                unitId: editorId,
                body: createFormulaHighlightBody(str, []),
            });
            return [];
        } else {
            const { textRuns, refSelections } = buildTextRuns(descriptionService, colorMap, sequenceNodes);
            if (leadingCharacterLength) {
                textRuns.forEach((e) => {
                    e.ed = e.ed + leadingCharacterLength;
                    e.st = e.st + leadingCharacterLength;
                });
            }

            const highlightDataStream = getFormulaHighlightDataStream(_leadingCharacter, sequenceNodes, sourceText);
            const highlightTextRuns = [{ st: 0, ed: 1, ts: { fs: 11 } }, ...textRuns];
            let selections;
            if (isNeedResetSelection) {
                // Switching between uppercase and lowercase will trigger a reflow, causing the cursor to be misplaced. Let's refresh the cursor position here.
                selections = editor.getSelectionRanges();
                // After 'buildTextRuns' , the content changes, most of it is deleted, and the cursor position needs to be corrected
                const maxOffset = highlightDataStream.length - 2 + leadingCharacterLength;
                selections.forEach((selection) => {
                    selection.startOffset = Math.max(0, Math.min(selection.startOffset, maxOffset));
                    selection.endOffset = Math.max(0, Math.min(selection.endOffset, maxOffset));
                });
            }
            commandService.syncExecuteCommand(ReplaceTextRunsCommand.id, {
                unitId: editorId,
                body: createFormulaHighlightBody(highlightDataStream.slice(0, -2), highlightTextRuns),
                textRanges: newSelections ?? selections,
            });
            return refSelections;
        }
    });
    return highlightDoc;
}

/**
 * ReplaceTextRunsCommand shifts the editor's existing structural metadata when text changes.
 * Its replacement body must therefore contain only inline formula data; carrying paragraphs
 * or section breaks copied from the old snapshot would leave their indexes stale.
 */
export function createFormulaHighlightBody(dataStream: string, textRuns: ITextRun[]): IDocumentBody {
    return { dataStream, textRuns };
}

export function getFormulaHighlightDataStream(leadingCharacter: string, sequenceNodes: Array<ISequenceNode | string>, sourceText?: string): string {
    const text = sourceText ?? sequenceNodes.reduce((pre, cur) => {
        if (typeof cur === 'string') {
            return `${pre}${cur}`;
        }
        return `${pre}${cur.token}`;
    }, '');

    return `${leadingCharacter}${text}\r\n`;
}

interface IColorMap {
    formulaRefColors: string[];
    numberColor: string;
    stringColor: string;
    plainTextColor: string;
}

export function useColor(): IColorMap {
    const themeService = useDependency(ThemeService);
    const theme = themeService.getCurrentTheme();
    const result = useMemo(() => {
        const formulaRefColors = [
            themeService.getColorFromTheme('loop-color.1'),
            themeService.getColorFromTheme('loop-color.2'),
            themeService.getColorFromTheme('loop-color.3'),
            themeService.getColorFromTheme('loop-color.4'),
            themeService.getColorFromTheme('loop-color.5'),
            themeService.getColorFromTheme('loop-color.6'),
            themeService.getColorFromTheme('loop-color.7'),
            themeService.getColorFromTheme('loop-color.8'),
            themeService.getColorFromTheme('loop-color.9'),
            themeService.getColorFromTheme('loop-color.10'),
            themeService.getColorFromTheme('loop-color.11'),
            themeService.getColorFromTheme('loop-color.12'),
        ].map((color) => themeService.isValidThemeColor(color) ? themeService.getColorFromTheme(color) : color);
        const numberColor = themeService.getColorFromTheme('blue.700');
        const stringColor = themeService.getColorFromTheme('jiqing.800');
        const plainTextColor = themeService.getColorFromTheme('black');
        return { formulaRefColors, numberColor, stringColor, plainTextColor };
    }, [theme]);
    return result;
}

// eslint-disable-next-line max-lines-per-function
export function buildTextRuns(descriptionService: IDescriptionService, colorMap: IColorMap, sequenceNodes: Array<ISequenceNode | string>) {
    const { formulaRefColors, numberColor, stringColor, plainTextColor } = colorMap;
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
                ts: {
                    cl: {
                        rgb: plainTextColor,
                    },
                    fs: 11,
                },
            });
            continue;
        }
        if (descriptionService.hasDefinedNameDescription(node.token.trim())) {
            textRuns.push({
                st: node.startIndex,
                ed: node.endIndex + 1,
                ts: {
                    cl: {
                        rgb: plainTextColor,
                    },
                    fs: 11,
                },
            });
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
                startIndex: node.startIndex,
                endIndex: node.endIndex,
                index: refSelections.length,
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
                    fs: 11,
                },
            });
        } else {
            textRuns.push({
                st: startIndex,
                ed: endIndex + 1,
                ts: {
                    cl: {
                        rgb: plainTextColor,
                    },
                    fs: 11,
                },
            });
        }
    }

    return { textRuns, refSelections };
};
