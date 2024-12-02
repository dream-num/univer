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
import { FWorksheet } from '@univerjs/sheets/facade';
import { type ICanvasFloatDom, SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { type IFComponentKey, transformComponentKey } from '@univerjs/sheets-ui/facade';
import { ComponentManager } from '@univerjs/ui';

export interface IFICanvasFloatDom extends Omit<ICanvasFloatDom, 'componentKey' | 'unitId' | 'subUnitId'>, IFComponentKey {}

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
    interface FWorksheet extends IFWorksheetLegacy {}
}
