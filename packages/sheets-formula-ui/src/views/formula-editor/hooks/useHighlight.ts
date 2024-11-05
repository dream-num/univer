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

import type { Workbook } from '@univerjs/core';
import type { ISequenceNode } from '@univerjs/engine-formula';
import type { ISelectionStyle, ISelectionWithStyle } from '@univerjs/sheets';
import { ColorKit, IUniverInstanceService, ThemeService, useDependency, useObservable } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, setEndForRange } from '@univerjs/sheets';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { attachRangeWithCoord, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { useEffect, useState } from 'react';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { buildTextRuns, useColor } from '../../range-selector/hooks/useHighlight';
import { useStateRef } from './useStateRef';

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

export function useSheetHighlight(isNeed: boolean, unitId: string, subUnitId: string, refSelections: IRefSelection[]) {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const themeService = useDependency(ThemeService);
    const refSelectionsService = useDependency(IRefSelectionsService);
    const renderManagerService = useDependency(IRenderManagerService);
    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const sheetSkeletonManagerService = render?.with(SheetSkeletonManagerService);

    const [ranges, rangesSet] = useState<ISelectionWithStyle[]>([]);

    const workbook = univerInstanceService.getUnit<Workbook>(unitId);
    const worksheet = workbook?.getSheetBySheetId(subUnitId);

    const activeSheet = useObservable(workbook?.activeSheet$);
    const contextRef = useStateRef({ activeSheet, sheetName: worksheet?.getName() });

    useEffect(() => {
        const workbook = univerInstanceService.getUnit<Workbook>(unitId);
        const selectionWithStyle: ISelectionWithStyle[] = [];
        const { activeSheet, sheetName } = contextRef.current;
        if (!workbook || !activeSheet || !isNeed) {
            rangesSet(selectionWithStyle);
            return;
        }

        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];
            const { themeColor, token, refIndex } = refSelection;

            const unitRangeName = deserializeRangeWithSheet(token);
            if (!unitRangeName.unitId) {
                unitRangeName.unitId = unitId;
            }
            if (!unitRangeName.sheetName) {
                unitRangeName.sheetName = sheetName || '';
            }
            const { unitId: refUnitId, sheetName: rangeSheetName, range: rawRange } = unitRangeName;
            if (unitId !== refUnitId) {
                continue;
            }

            if (rangeSheetName !== activeSheet.getName()) {
                continue;
            }

            const range = setEndForRange(rawRange, activeSheet.getRowCount(), activeSheet.getColumnCount());

            selectionWithStyle.push({
                range,
                primary: null,
                style: getFormulaRefSelectionStyle(themeService, themeColor, refIndex.toString()),
            });
        }
        rangesSet(selectionWithStyle);
    }, [unitId, subUnitId, refSelections, isNeed]);

    useEffect(() => {
        const skeleton = sheetSkeletonManagerService?.getCurrentSkeleton();
        if (skeleton && isNeed) {
            const allControls = refSelectionsRenderService?.getSelectionControls() || [];
            if (allControls.length === ranges.length) {
                allControls.forEach((control, index) => {
                    const selection = ranges[index];
                    control.updateRange(attachRangeWithCoord(skeleton, selection.range), null);
                    control.updateStyle(selection.style!);
                });
            } else {
                refSelectionsService.setSelections(ranges);
            }
        }
    }, [ranges, isNeed]);
}

export function useDocHight(editorId: string, sequenceNodes: (string | ISequenceNode)[]) {
    const editorService = useDependency(IEditorService);
    const descriptionService = useDependency(IDescriptionService);
    const colorMap = useColor();
    const [ranges, rangesSet] = useState<IRefSelection[]>([]);

    useEffect(() => {
        const editor = editorService.getEditor(editorId);
        if (!editor) {
            return;
        }
        const data = editor.getDocumentData();
        if (!data) {
            return;
        }
        const body = data.body;
        if (!body) {
            return;
        }
        const cloneBody = { dataStream: '', ...data.body };

        if (sequenceNodes == null || sequenceNodes.length === 0) {
            cloneBody.textRuns = [];
            cloneBody.dataStream = data.body?.dataStream || '\r\n';
            rangesSet([]);
        } else {
            const { textRuns, refSelections } = buildTextRuns(descriptionService, colorMap, sequenceNodes);
            // 公式前面需要加1
            textRuns.forEach((e) => {
                e.ed++;
                e.st++;
            });
            cloneBody.textRuns = textRuns;
            const text = sequenceNodes.reduce((pre, cur) => {
                if (typeof cur === 'string') {
                    return `${pre}${cur}`;
                }
                return `${pre}${cur.token}`;
            }, '');
            cloneBody.dataStream = `=${text}\r\n`;
            rangesSet(refSelections);
        }
        // Switching between uppercase and lowercase will trigger a reflow, causing the cursor to be misplaced. Let's refresh the cursor position here.
        const selections = editor.getSelectionRanges();
        // After 'buildTextRuns' , the content changes, most of it is deleted, and the cursor position needs to be corrected
        const maxOffset = cloneBody.dataStream.length - 2;
        selections.forEach((selection) => {
            selection.startOffset = Math.max(0, Math.min(selection.startOffset, maxOffset));
            selection.endOffset = Math.max(0, Math.min(selection.endOffset, maxOffset));
        });
        const cloneData = { ...data, body: cloneBody };
        editor.setDocumentData(cloneData, selections);
    }, [editorId, sequenceNodes, colorMap]);

    return ranges;
}

function getFormulaRefSelectionStyle(themeService: ThemeService, refColor: string, id: string): ISelectionStyle {
    const style = themeService.getCurrentTheme();
    const fill = new ColorKit(refColor).setAlpha(0.05).toRgbString();
    return {
        id,
        strokeWidth: 1,
        stroke: refColor,
        fill,
        widgets: { tl: true, tc: true, tr: true, ml: true, mr: true, bl: true, bc: true, br: true },
        widgetSize: 6,
        widgetStrokeWidth: 1,
        widgetStroke: style.colorWhite,
        hasAutoFill: false,
        hasRowHeader: false,
        hasColumnHeader: false,
    };
}
