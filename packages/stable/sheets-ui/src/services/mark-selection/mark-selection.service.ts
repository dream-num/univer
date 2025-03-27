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
import type { RenderUnit } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { createIdentifier, Disposable, Inject, IUniverInstanceService, ThemeService, Tools, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';

import { SELECTION_SHAPE_DEPTH } from '../selection/const';
import { SelectionControl } from '../selection/selection-control';
import { attachSelectionWithCoord } from '../selection/util';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

export interface IMarkSelectionService {
    addShape(selection: ISelectionWithStyle, exits?: string[], zIndex?: number): string | null;
    addShapeWithNoFresh(selection: ISelectionWithStyle, exits?: string[], zIndex?: number): string | null;
    removeShape(id: string): void;
    removeAllShapes(): void;
    refreshShapes(): void;
    getShapeMap(): Map<string, IMarkSelectionInfo>;
}

interface IMarkSelectionInfo {
    unitId: string;
    subUnitId: string;
    selection: ISelectionWithStyle;
    zIndex: number;
    control: SelectionControl | null;
    exits: string[];
}

const DEFAULT_Z_INDEX = SELECTION_SHAPE_DEPTH.MARK_SELECTION; ;
export const IMarkSelectionService = createIdentifier<IMarkSelectionService>('univer.mark-selection-service');

/**
 * For copy and cut selection.
 * also for selection when hover on conditional format items in the cf panel on the right.
 * NOT FOR hovering on panel in data validation.
 */
export class MarkSelectionService extends Disposable implements IMarkSelectionService {
    private _shapeMap: Map<string, IMarkSelectionInfo> = new Map();

    constructor(
        @IUniverInstanceService private readonly _currentService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();
    }

    addShape(selection: ISelectionWithStyle, exits: string[] = [], zIndex: number = DEFAULT_Z_INDEX): string | null {
        const workbook = this._currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const subUnitId = workbook.getActiveSheet()?.getSheetId();
        if (!subUnitId) return null;
        const id = Tools.generateRandomId();

        const markSelectionInfo: IMarkSelectionInfo = {
            selection,
            subUnitId,
            unitId: workbook.getUnitId(),
            zIndex,
            control: null,
            exits,
        };
        this._shapeMap.set(id, markSelectionInfo);

        this.refreshShapes();
        return id;
    }

    addShapeWithNoFresh(selection: ISelectionWithStyle, exits: string[] = [], zIndex: number = DEFAULT_Z_INDEX): string | null {
        const workbook = this._currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const subUnitId = workbook.getActiveSheet()?.getSheetId();
        if (!subUnitId) return null;
        const id = Tools.generateRandomId();
        this._shapeMap.set(id, {
            selection,
            subUnitId,
            unitId: workbook.getUnitId(),
            zIndex,
            control: null,
            exits,
        });

        return id;
    }

    refreshShapes(): void {
        const currentSheet = this._currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!currentSheet) return;

        const currentUnitId = currentSheet.getUnitId();
        const currentSubUnitId = currentSheet.getActiveSheet()?.getSheetId();
        this._shapeMap.forEach((shape) => {
            const { unitId, subUnitId, selection, control: oldControl, zIndex } = shape;
            oldControl?.dispose();

            if (unitId !== currentUnitId || subUnitId !== currentSubUnitId) {
                return;
            }

            const renderUnit = this._renderManagerService.getRenderById(unitId) as RenderUnit;
            if (!renderUnit) return;

            const skeleton = renderUnit.with(SheetSkeletonManagerService).getCurrentSkeleton();
            if (!skeleton) return;

            const { scene } = renderUnit;
            const { rowHeaderWidth, columnHeaderHeight } = skeleton;
            const control = new SelectionControl(scene, zIndex, this._themeService, {
                enableAutoFill: false,
                highlightHeader: false,
                rowHeaderWidth,
                columnHeaderHeight,
            });
            const selectionWithCoord = attachSelectionWithCoord(selection, skeleton);
            control.updateRangeBySelectionWithCoord(selectionWithCoord);
            shape.control = control;
        });
    }

    getShapeMap(): Map<string, IMarkSelectionInfo> {
        return this._shapeMap;
    }

    removeShape(id: string): void {
        const shapeInfo = this._shapeMap.get(id);
        if (!shapeInfo) return;
        const { control } = shapeInfo;
        control?.dispose();
        this._shapeMap.delete(id);
    }

    removeAllShapes(): void {
        for (const shape of this._shapeMap.values()) {
            const { control } = shape;
            control?.dispose();
        }
        this._shapeMap.clear();
    }
}
