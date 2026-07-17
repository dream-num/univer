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

import type { IDisposable } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import type { ICellDropdown } from '../views/dropdown';
import {
    createIdentifier,
    Disposable,
    DisposableCollection,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    Inject,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { dropdownMap } from '../views/dropdown';
import { SheetCanvasPopManagerService } from './canvas-pop-manager.service';

export type IDropdownParam = {
    location: ISheetLocation;
    onHide?: () => void;
    closeOnOutSide?: boolean;
} & ICellDropdown;

export interface IDropdownComponentProps {
    componentKey: string;
    location: ISheetLocation;
    hideFn: () => void;
}

export interface ISheetCellDropdownManagerService {
    showDropdown(param: IDropdownParam): IDisposable;
}
export const ISheetCellDropdownManagerService = createIdentifier<ISheetCellDropdownManagerService>('ICellDropdownManagerService');

export class SheetCellDropdownManagerService extends Disposable implements ISheetCellDropdownManagerService {
    constructor(
        @Inject(SheetCanvasPopManagerService) private readonly _canvasPopupManagerService: SheetCanvasPopManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    showDropdown(param: IDropdownParam): IDisposable {
        const { location, onHide, closeOnOutSide = true } = param;
        const { row, col, unitId, subUnitId } = location;

        const component = dropdownMap[param.type];
        const currentRender = this._renderManagerService.getRenderById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        const disposable = new DisposableCollection();
        const popupDisposable = this._canvasPopupManagerService.attachPopupToCell(
            row,
            col,
            {
                componentKey: component.componentKey,
                onClickOutside: () => {
                    if (closeOnOutSide) {
                        disposable.dispose();
                    }
                },
                offset: [0, 3],
                excludeOutside: [currentRender?.engine.getCanvasElement()].filter(Boolean) as HTMLElement[],
                extraProps: {
                    ...param,
                    ...param.props,
                    hideFn: () => {
                        disposable.dispose();
                    },
                },
            },
            unitId,
            subUnitId
        );

        if (!popupDisposable) {
            throw new Error('[SheetCellDropdownManagerService]: cannot show dropdown');
        }

        disposable.add(popupDisposable);
        disposable.add({
            dispose: () => {
                onHide?.();
            },
        });

        return disposable;
    }
}
