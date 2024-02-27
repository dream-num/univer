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

import { useDependency } from '@wendellhu/redi/react-bindings';
import { useObservable } from '@univerjs/design';
import React from 'react';
import { CellAlertManagerService } from '../../services/cell-alert-manager.service';

export function CellAlert() {
    const cellAlertService = useDependency(CellAlertManagerService);
    const currentCell = useObservable(cellAlertService.currentAlert$);

    if (!currentCell) {
        return null;
    }

    const style: React.CSSProperties = {
        position: 'absolute',
        top: currentCell.offsetY,
        left: currentCell.offsetX,
    };

    return (
        <div style={style}>
            <div>{currentCell.title}</div>
            <div>{currentCell.message}</div>
        </div>
    );
}
