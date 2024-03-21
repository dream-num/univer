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

import { IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { BaseObject, IBoundRectNoAngle, Viewport } from '@univerjs/engine-render';
import { IPopupService } from '@univerjs/ui/services/popup/popup.service.js';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { VIEWPORT_KEY } from '../common/keys';
import { getViewportByCell } from '../common/utils';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

interface ICanvasPopup {
    componentKey: string;
    mask?: boolean;
    onMaskClick?: React.MouseEventHandler<HTMLDivElement>;
    direction?: 'vertical' | 'horizontal';
}

export class CanvasPopManagerService {
    constructor(
        @Inject(IPopupService) private readonly _popupService: IPopupService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {}

    addPopupToObject(baseObject: BaseObject, popup: ICanvasPopup, viewport?: Viewport): IDisposable {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const skeletonParam = this._sheetSkeletonManagerService.getOrCreateSkeleton({
            unitId,
            sheetId: subUnitId,
        });
        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (!currentRender || !skeletonParam) {
            return {
                dispose: () => {},
            };
        }

        const { scene } = currentRender;
        const { left, top, width, height } = baseObject;
        const activeViewport = viewport ?? scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        if (!activeViewport) {
            return {
                dispose: () => {},
            };
        }
        const rect = {
            startX: left,
            endX: left + width,
            startY: top,
            endY: top + height,
        };
        const { scaleX, scaleY } = scene.getAncestorScale();
        const scrollXY = {
            x: activeViewport.actualScrollX,
            y: activeViewport.actualScrollY,
        };
        const bounding = currentRender.engine.getCanvasElement().getBoundingClientRect();

        const position = {
            left: (rect.startX - scrollXY.x) * scaleX,
            right: (rect.endX - scrollXY.x) * scaleX,
            top: ((rect.startY - scrollXY.y) * scaleY) + bounding.top,
            bottom: ((rect.endY - scrollXY.y) * scaleY) + bounding.top,
        };

        const id = this._popupService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
        });

        return {
            dispose: () => {
                this._popupService.removePopup(id);
            },
        };
    }

    addPopupToCell(row: number, col: number, popup: ICanvasPopup, viewport?: Viewport) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const skeleton = this._sheetSkeletonManagerService.getOrCreateSkeleton({
            unitId,
            sheetId: subUnitId,
        });
        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (!currentRender || !skeleton) {
            return {
                dispose: () => {},
            };
        }

        const { scene } = currentRender;

        const activeViewport = viewport ?? getViewportByCell(row, col, scene, worksheet);

        if (!activeViewport) {
            return {
                dispose: () => {},
            };
        }

        const cellInfo = skeleton.getCellByIndex(row, col);

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scrollXY = {
            x: activeViewport.actualScrollX,
            y: activeViewport.actualScrollY,
        };

        const bounding = currentRender.engine.getCanvasElement().getBoundingClientRect();

        const position: IBoundRectNoAngle = {
            left: ((cellInfo.startX - scrollXY.x) * scaleX),
            right: (cellInfo.endX - scrollXY.x) * scaleX,
            top: ((cellInfo.startY - scrollXY.y) * scaleY) + bounding.top,
            bottom: ((cellInfo.endY - scrollXY.y) * scaleY) + bounding.top,
        };

        const id = this._popupService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
        });

        return {
            dispose: () => {
                this._popupService.removePopup(id);
            },
        };
    }
}
