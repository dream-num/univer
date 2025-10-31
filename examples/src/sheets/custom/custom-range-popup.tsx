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
import { LifecycleStages } from '@univerjs/core';

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

const OFFSETS: Partial<Record<RectPopupDirection, [number, number]>> = {
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

const RANGE = 'C40:F45';

function createPopupComponent(direction: RectPopupDirection) {
    return () => {
        return (<div style={{ color: 'red', border: '1px solid red' }}>{direction}</div>);
    };
}

function generateComponentKey(direction: RectPopupDirection) {
    return `PopupComponent${direction.split('-').map((segment) => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`)}`;
}

export function customRangePopups(univer: Univer, univerAPI: FUniver) {
    const workbook = univerAPI.getWorkbook('workbook-01');
    const worksheet = workbook?.getSheetBySheetId('sheet-0011');
    const range = worksheet?.getRange(RANGE);
    if (range) {
        DIRECTIONS.forEach((direction) => {
            univerAPI.registerComponent(generateComponentKey(direction), createPopupComponent(direction));
        });
        univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
            if (params.stage === LifecycleStages.Rendered) {
                DIRECTIONS.forEach((direction) => {
                    range.attachRangePopup({
                        componentKey: generateComponentKey(direction),
                        direction,
                        offset: OFFSETS[direction] ?? [0, 0],
                        showOnSelectionMoving: true,
                    });
                });
            }
        });
    }
}
