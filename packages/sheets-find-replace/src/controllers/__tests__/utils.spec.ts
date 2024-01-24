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

import { describe, expect, it } from 'vitest';

import {
    isBeforePositionWithColumnPriority,
    isBeforePositionWithRowPriority,
    isBehindPositionWithColumnPriority,
    isBehindPositionWithRowPriority,
    isSamePosition,
} from '../utils';

describe('Test sheet find replace utils', () => {
    it('Should "isSamePosition" work as expected', () => {
        expect(
            isSamePosition(
                { startRow: 12, endColumn: 24, startColumn: 22, endRow: 25 },
                { startRow: 12, endRow: 23, startColumn: 22, endColumn: 28 }
            )
        ).toBeTruthy();

        expect(
            isSamePosition(
                { startRow: 13, endColumn: 24, startColumn: 22, endRow: 25 },
                { startRow: 12, endRow: 23, startColumn: 22, endColumn: 28 }
            )
        ).toBeFalsy();

        expect(
            isSamePosition(
                { startRow: 12, endColumn: 24, startColumn: 24, endRow: 25 },
                { startRow: 12, endRow: 23, startColumn: 22, endColumn: 28 }
            )
        ).toBeFalsy();
    });

    it('Should "isBehindPositionWithRowPriority" work as expected', () => {
        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }
            )
        ).toBeFalsy();

        expect(
            isBehindPositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }
            )
        ).toBeFalsy();
    });

    it('Should "isBehindPositionWithColumnPriority" work as expected', () => {
        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }
            )
        ).toBeTruthy();

        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }
            )
        ).toBeFalsy();

        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }
            )
        ).toBeFalsy();

        expect(
            isBehindPositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();
    });

    it('Should "isBeforePositionWithRowPriority" work as expected', () => {
        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }
            )
        ).toBeFalsy();

        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }
            )
        ).toBeFalsy();

        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithRowPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }
            )
        ).toBeTruthy();
    });

    it('Should "isBeforePositionWithColumnPriority" work as expected', () => {
        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }
            )
        ).toBeFalsy();

        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }
            )
        ).toBeTruthy();

        expect(
            isBeforePositionWithColumnPriority(
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                { startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 }
            )
        ).toBeFalsy();
    });
});
