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

import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import type { RectPopupDirection } from '@univerjs/ui';
import { DisposableCollection, LifecycleStages } from '@univerjs/core';

const DIRECTIONS: RectPopupDirection[] = [
    'left',
    'left-center',
    'left-bottom',
    'left-top',
    'right',
    'right-center',
    'right-bottom',
    'right-top',
    'top',
    'top-center',
    'top-left',
    'top-right',
    'bottom',
    'bottom-center',
    'bottom-left',
    'bottom-right',
    'vertical',
    'vertical-left',
    'vertical-right',
    'vertical-center',
    'horizontal',
    'horizontal-top',
    'horizontal-bottom',
    'horizontal-center',
];

const RANGE_OFFSETS: Partial<Record<RectPopupDirection, [number, number]>> = {
    'vertical-left': [80, 0],
    left: [55, 0],
    right: [350, 0],
    top: [0, 20],
    bottom: [0, 20],
    vertical: [0, 40],
    horizontal: [170, 0],
    'vertical-right': [250, 0],
    'vertical-center': [220, 0],
    'horizontal-top': [65, 0],
    'horizontal-center': [90, 0],
    'horizontal-bottom': [90, 0],
};
const CELL_OFFSETS: Partial<Record<RectPopupDirection, [number, number]>> = {
    'vertical-left': [80, 0],
    left: [55, 0],
    right: [350, 0],
    top: [0, 20],
    bottom: [0, 20],
    vertical: [0, 40],
    horizontal: [170, 0],
    'vertical-right': [250, 0],
    'vertical-center': [220, 0],
    'horizontal-top': [65, 0],
    'horizontal-center': [90, 0],
    'horizontal-bottom': [90, 0],
};

const WORKBOOK_ID = 'workbook-01';
const WORKSHEET_ID = 'sheet-0011';
const RANGE = 'C40:F45';
const CELL = 'T60';

function createPopupComponent(direction: RectPopupDirection) {
    return () => {
        return (<div style={{ color: 'red', border: '1px solid red' }}>{direction}</div>);
    };
}

function generateComponentKey(direction: RectPopupDirection) {
    return `PopupComponent${direction.split('-').map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`).join('')}`;
}

export function customRangePopups(univer: Univer, univerAPI: FUniver) {
    const disposables = new DisposableCollection();

    const workbook = univerAPI.getWorkbook(WORKBOOK_ID);
    const worksheet = workbook?.getSheetBySheetId(WORKSHEET_ID);

    DIRECTIONS.forEach((direction) => {
        disposables.add(univerAPI.registerComponent(generateComponentKey(direction), createPopupComponent(direction)));
    });

    const range = worksheet?.getRange(RANGE);
    if (range) {
        disposables.add(
            univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
                if (params.stage === LifecycleStages.Rendered) {
                    DIRECTIONS.forEach((direction) => {
                        const disposable = range.attachRangePopup({
                            componentKey: generateComponentKey(direction),
                            direction,
                            offset: RANGE_OFFSETS[direction] ?? [0, 0],
                            showOnSelectionMoving: true,
                        });
                        if (disposable) {
                            disposables.add(disposable);
                        }
                    });
                }
            })
        );
    }
    const cell = worksheet?.getRange(CELL);
    if (cell) {
        worksheet?.setColumnWidth(cell.getColumn(), 300);
        worksheet?.setRowHeight(cell.getRow(), 100);
        disposables.add(
            univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
                if (params.stage === LifecycleStages.Rendered) {
                    DIRECTIONS.forEach((direction) => {
                        const disposable = cell.attachPopup({
                            componentKey: generateComponentKey(direction),
                            direction,
                            offset: CELL_OFFSETS[direction] ?? [0, 0],
                            showOnSelectionMoving: true,
                        });
                        if (disposable) {
                            disposables.add(disposable);
                        }
                    });
                }
            })
        );
    }

    return disposables;
}
