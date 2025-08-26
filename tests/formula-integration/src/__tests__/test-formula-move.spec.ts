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

import { describe, it } from 'vitest';
import { expectMoveFormulaCellResultMatchesSnapshot, expectMoveFormulaRowsResultMatchesSnapshot, expectMoveFormulaSiRowsResultMatchesSnapshot } from '../__testing__/test-formula-move';

describe('Test formula move', () => {
    it('move formula rows', () => {
        expectMoveFormulaRowsResultMatchesSnapshot();
    });

    it('move formula si rows', () => {
        expectMoveFormulaSiRowsResultMatchesSnapshot();
    });

    it('move formula cell', () => {
        expectMoveFormulaCellResultMatchesSnapshot();
    });
});
