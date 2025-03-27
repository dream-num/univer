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

import type { IRange } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';
import { IMarkSelectionService } from '../services/mark-selection/mark-selection.service';

export const useHighlightRange = (ranges: IRange[] = []) => {
    const markSelectionService = useDependency(IMarkSelectionService);
    useEffect(() => {
        const ids = ranges.map((range) => markSelectionService.addShape({
            range,
            style: {
                fill: 'rgba(73, 184, 17, 0.05)',
                strokeWidth: 1,
                stroke: '#49B811',
                widgets: {},
            },
            primary: {
                startColumn: range.startColumn,
                endColumn: range.endColumn,
                startRow: range.startRow,
                endRow: range.endRow,
                actualRow: range.startRow,
                actualColumn: range.startColumn,
                isMerged: false,
                isMergedMainCell: false,
            },
        }));
        return () => {
            ids.forEach((id) => {
                id && markSelectionService.removeShape(id);
            });
        };
    }, [ranges]);
};
