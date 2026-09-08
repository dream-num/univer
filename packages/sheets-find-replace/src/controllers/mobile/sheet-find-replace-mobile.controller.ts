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

import type { Workbook } from '@univerjs/core';
import type { IScrollToCellCommandParams } from '@univerjs/sheets-ui';
import { Disposable, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { convertTransformToOffsetY, IRenderManagerService } from '@univerjs/engine-render';
import {
    getCoordByCell,
    getSheetObject,
    getViewportByCell,
    ScrollToCellCommand,
    SetScrollRelativeCommand,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';

const MOBILE_FIND_REPLACE_BAR_SELECTOR = '[data-u-comp="mobile-find-replace-bar"]';
const MOBILE_FIND_MATCH_SAFE_PADDING = 8;

export function getMobileFindMatchScrollOffset(cellBottom: number, barTop: number, safePadding: number): number {
    return Math.max(0, cellBottom - barTop + safePadding);
}

export class SheetsFindReplaceMobileController extends Disposable {
    private _pendingFrameId: number | null = null;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this.disposeWithMe(this._commandService.onCommandExecuted((command, options) => {
            if (command.id !== ScrollToCellCommand.id || options?.fromFindReplace !== true) {
                return;
            }

            const range = (command.params as IScrollToCellCommandParams | undefined)?.range;
            if (!range) {
                return;
            }

            const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getActiveSheet();
            if (!workbook || !worksheet) {
                return;
            }

            this._scheduleReveal(workbook.getUnitId(), worksheet.getSheetId(), range.endRow, range.endColumn);
        }));
    }

    override dispose(): void {
        if (this._pendingFrameId !== null) {
            cancelAnimationFrame(this._pendingFrameId);
            this._pendingFrameId = null;
        }

        super.dispose();
    }

    private _scheduleReveal(unitId: string, subUnitId: string, row: number, column: number): void {
        if (this._pendingFrameId !== null) {
            cancelAnimationFrame(this._pendingFrameId);
        }

        this._pendingFrameId = requestAnimationFrame(() => {
            this._pendingFrameId = null;
            this._revealMatch(unitId, subUnitId, row, column);
        });
    }

    private _revealMatch(unitId: string, subUnitId: string, row: number, column: number): void {
        const bar = document.querySelector<HTMLElement>(MOBILE_FIND_REPLACE_BAR_SELECTOR);
        if (!bar) {
            return;
        }

        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet || workbook.getUnitId() !== unitId || worksheet.getSheetId() !== subUnitId) {
            return;
        }

        const render = this._renderManagerService.getRenderUnitById(workbook.getUnitId());
        const sheetObject = getSheetObject(workbook, this._renderManagerService);
        const skeleton = render?.with(SheetSkeletonManagerService).getSkeleton(worksheet.getSheetId());
        if (!sheetObject || !skeleton) {
            return;
        }

        const { scene, engine } = sheetObject;
        const viewport = getViewportByCell(row, column, scene, worksheet);
        if (!viewport) {
            return;
        }

        const { endY } = getCoordByCell(row, column, scene, skeleton);
        const { scaleY } = scene.getAncestorScale();
        const scrollXY = scene.getViewportScrollXY(viewport);
        const canvasTop = engine.getCanvasElement().getBoundingClientRect().top;
        const cellBottom = canvasTop + convertTransformToOffsetY(endY, scaleY, scrollXY);
        const offsetY = getMobileFindMatchScrollOffset(
            cellBottom,
            bar.getBoundingClientRect().top,
            MOBILE_FIND_MATCH_SAFE_PADDING
        );
        if (offsetY === 0) {
            return;
        }

        this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY }).catch(() => undefined);
    }
}
