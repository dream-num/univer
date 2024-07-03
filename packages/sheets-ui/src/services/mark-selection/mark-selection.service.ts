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
import { Disposable, IUniverInstanceService, ThemeService, Tools, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { createIdentifier, Inject } from '@wendellhu/redi';

import { SelectionControl } from '../selection/selection-shape';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { ISheetSelectionRenderService } from '../selection/base-selection-render.service';

export interface IMarkSelectionService {
    addShape(selection: ISelectionWithStyle, exits?: string[], zIndex?: number): string | null;
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

const DEFAULT_Z_INDEX = 10000;
export const IMarkSelectionService = createIdentifier<IMarkSelectionService>('univer.mark-selection-service');

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
        this._shapeMap.set(id, {
            selection,
            subUnitId,
            unitId: workbook.getUnitId(),
            zIndex,
            control: null,
            exits,
        });

        this.refreshShapes();
        return id;
    }

    refreshShapes() {
        const currentSheet = this._currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!currentSheet) return;

        const currentUnitId = currentSheet.getUnitId();
        const currentSubUnitId = currentSheet.getActiveSheet()?.getSheetId();
        this._shapeMap.forEach((shape) => {
            const { unitId, subUnitId, selection, control: oldControl, zIndex } = shape;

            oldControl && oldControl.dispose();

            if (unitId !== currentUnitId || subUnitId !== currentSubUnitId) {
                return;
            }

            const { style } = selection;
            const renderUnit = this._renderManagerService.getRenderById(unitId);
            if (!renderUnit) return;

            const skeleton = this._renderManagerService.withCurrentTypeOfUnit(UniverInstanceType.UNIVER_SHEET, SheetSkeletonManagerService)?.getCurrentSkeleton();
            if (!skeleton) return;

            const { scene } = renderUnit;
            const { rowHeaderWidth, columnHeaderHeight } = skeleton;
            const control = new SelectionControl(scene, zIndex, false, this._themeService);
            const { rangeWithCoord, primaryWithCoord } = renderUnit.with(ISheetSelectionRenderService).attachSelectionWithCoord(selection);
            control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
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
        control && control.dispose();
        this._shapeMap.delete(id);
    }

    removeAllShapes(): void {
        for (const shape of this._shapeMap.values()) {
            const { control } = shape;
            control && control.dispose();
        }
        this._shapeMap.clear();
    }
}
