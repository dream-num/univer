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

import type { ISheetLocationBase } from '@univerjs/sheets';
import type { IPopupWithExtraProps } from '@univerjs/ui';
import type { CellPopupDirection } from '../services/cell-popup-manager.service';
import { ComponentManager, useDependency, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';
import { filter, map } from 'rxjs';
import { CellPopupManagerService } from '../services/cell-popup-manager.service';

export const CellPopup = (props: { popup: IPopupWithExtraProps<ISheetLocationBase & { direction: CellPopupDirection }> }) => {
    const { popup } = props;
    const location = popup.extraProps;
    const { row, col, direction, unitId, subUnitId } = location;
    const cellPopupManagerService = useDependency(CellPopupManagerService);
    const popups = useObservable(
        useMemo(() => cellPopupManagerService.change$.pipe(
            filter((change) => change.row === row && change.col === col && change.direction === direction),
            map(() => cellPopupManagerService.getPopups(unitId, subUnitId, row, col, direction))
        ), [cellPopupManagerService, col, direction, row, subUnitId, unitId]),
        cellPopupManagerService.getPopups(unitId, subUnitId, row, col, direction)
    );
    const componentManager = useDependency(ComponentManager);

    return (
        <div
            data-u-comp="sheets-ui-cell-popup"
            className={`
              ${direction === 'left-center' ? 'univer-mr-px' : 'univer-ml-px'}
              univer-flex univer-flex-col
            `}
        >
            {popups.map((popup) => {
                const Component = componentManager.get(popup.componentKey);
                return Component ? <Component key={popup.id ?? popup.componentKey} popup={popup} /> : null;
            })}
        </div>
    );
};
