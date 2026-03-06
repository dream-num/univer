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

import { describe, expect, it, vi } from 'vitest';
import { SHEET_TABLE_THEME_PANEL, TABLE_SELECTOR_DIALOG, TABLE_TOOLBAR_BUTTON } from '../../const';
import { menuSchema } from '../menu.schema';
import { SheetTableMenuController } from '../sheet-table-menu.controller';

describe('SheetTableMenuController', () => {
    it('should register table components and merge table menu schema', () => {
        const register = vi.fn(() => ({ dispose: vi.fn() }));
        const mergeMenu = vi.fn();

        const controller = new SheetTableMenuController(
            { register } as any,
            { mergeMenu } as any
        );

        expect(register).toHaveBeenCalledTimes(3);
        const calls = register.mock.calls as Array<Array<any>>;
        expect(calls[0]?.[0]).toBe(TABLE_TOOLBAR_BUTTON);
        expect(calls[1]?.[0]).toBe(TABLE_SELECTOR_DIALOG);
        expect(calls[2]?.[0]).toBe(SHEET_TABLE_THEME_PANEL);
        expect(mergeMenu).toHaveBeenCalledWith(menuSchema);

        controller.dispose();
    });
});
