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

import type { Nullable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { type ICanvasFloatDom, SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { type IFComponentKey, transformComponentKey } from '@univerjs/sheets-ui/facade';
import { FWorksheet } from '@univerjs/sheets/facade';
import { ComponentManager } from '@univerjs/ui';

export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey { }

export interface IFWorksheetLegacy {
    /**
     * add a float dom to position
     * @param layer float dom config
     * @param id float dom id, if not given will be auto generated
     * @returns float dom id and dispose function
     */
    addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }>;
}

export class FWorksheetLegacy extends FWorksheet implements IFWorksheetLegacy {
    override addFloatDomToPosition(layer: IFICanvasFloatDom, id?: string): Nullable<{
        id: string;
        dispose: () => void;
    }> {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const renderManagerService = this._injector.get(IRenderManagerService);
        const render = renderManagerService.getRenderById(unitId);

        if (render) {
            const sheetSkeletonService = render.with(SheetSkeletonManagerService);
            sheetSkeletonService.reCalculate();
            const sk = sheetSkeletonService.getCurrentSkeleton();
            if (sk) {
                const domHeight = layer.initPosition.endY - layer.initPosition.startY;
                const domWidth = layer.initPosition.endX - layer.initPosition.startX;
                const maxStartY = sk.rowHeightAccumulation[sk.rowHeightAccumulation.length - 1] - (layer.initPosition.endY - layer.initPosition.startY);
                const maxStartX = sk.columnWidthAccumulation[sk.columnWidthAccumulation.length - 1] - (layer.initPosition.endX - layer.initPosition.startX);
                layer.initPosition.startY = maxStartY;
                layer.initPosition.startX = maxStartX;
                layer.initPosition.endY = maxStartY + domHeight;
                layer.initPosition.endX = maxStartX + domWidth;
            }
        }

        const { key, disposableCollection } = transformComponentKey(layer, this._injector.get(ComponentManager));
        const floatDomService = this._injector.get(SheetCanvasFloatDomManagerService);
        const res = floatDomService.addFloatDomToPosition({ ...layer, componentKey: key, unitId, subUnitId }, id);

        if (res) {
            disposableCollection.add(res.dispose);
            return {
                id: res.id,
                dispose: (): void => {
                    disposableCollection.dispose();
                    res.dispose();
                },
            };
        }

        disposableCollection.dispose();
        return null;
    }
}

FWorksheet.extend(FWorksheetLegacy);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetLegacy { }
}
