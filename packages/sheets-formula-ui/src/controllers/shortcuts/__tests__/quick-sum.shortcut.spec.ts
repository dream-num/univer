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

import { EDITOR_ACTIVATED, FOCUSING_SHEET, FOCUSING_UNIVER_EDITOR, IContextService, Univer } from '@univerjs/core';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { describe, expect, it, onTestFinished } from 'vitest';
import { InsertFunctionOperation } from '../../../commands/operations/insert-function.operation';
import { QuickSumShortcut } from '../quick-sum.shortcut';

describe('QuickSumShortcut', () => {
    it('binds quick sum to SUM insertion while the sheet has focus', () => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        const context = univer.__getInjector().get(IContextService);
        context.setContextValue(FOCUSING_SHEET, true);
        context.setContextValue(FOCUSING_UNIVER_EDITOR, true);
        expect(QuickSumShortcut.id).toBe(InsertFunctionOperation.id);
        expect(QuickSumShortcut.staticParameters).toEqual({ value: 'SUM' });
        expect(QuickSumShortcut.binding).toBe(MetaKeys.ALT | KeyCode.EQUAL);
        expect(QuickSumShortcut.mac).toBe(MetaKeys.CTRL_COMMAND | MetaKeys.ALT | KeyCode.EQUAL);
        context.setContextValue(EDITOR_ACTIVATED, false);
        expect(QuickSumShortcut.preconditions?.(context)).toBe(true);
        context.setContextValue(EDITOR_ACTIVATED, true);
        expect(QuickSumShortcut.preconditions?.(context)).toBe(false);
    });
});
