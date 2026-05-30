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

import { describe, expect, it } from 'vitest';
import { checkIfMove, MOVE_BUFFER_VALUE, ROTATE_BUFFER_VALUE } from '../check-if-move';
import { columnLabelToNumber, MAX_COLUMN_COUNT, MAX_ROW_COUNT } from '../max-row-column';

describe('drawing and sheet utils', () => {
    it('should detect meaningful movement and treat null transforms as changed', () => {
        expect(checkIfMove(null, { left: 0, top: 0 })).toBe(true);
        expect(checkIfMove({ left: 0, top: 0 }, null)).toBe(true);

        expect(checkIfMove(
            { left: 10, top: 10, width: 100, height: 50, angle: 0 },
            { left: 11, top: 11, width: 101, height: 51, angle: 1 }
        )).toBe(false);

        expect(checkIfMove(
            { left: 10 + MOVE_BUFFER_VALUE + 1, top: 10, width: 100, height: 50, angle: 0 },
            { left: 10, top: 10, width: 100, height: 50, angle: 0 }
        )).toBe(true);

        expect(checkIfMove(
            { left: 10, top: 10, width: 100, height: 50, angle: ROTATE_BUFFER_VALUE + 2 },
            { left: 10, top: 10, width: 100, height: 50, angle: 0 }
        )).toBe(true);
    });

    it('should convert excel column labels and expose workbook limits', () => {
        expect(columnLabelToNumber('A')).toBe(1);
        expect(columnLabelToNumber('Z')).toBe(26);
        expect(columnLabelToNumber('AA')).toBe(27);
        expect(columnLabelToNumber('XFD')).toBe(MAX_COLUMN_COUNT);
        expect(columnLabelToNumber('A1')).toBe(-1);

        expect(MAX_ROW_COUNT).toBe(1048576);
        expect(MAX_COLUMN_COUNT).toBe(16384);
    });
});
