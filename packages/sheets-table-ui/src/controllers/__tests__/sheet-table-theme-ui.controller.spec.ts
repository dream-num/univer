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

import { SetRangeThemeMutation } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SheetTableThemeUIController } from '../sheet-table-theme-ui.controller';

describe('SheetTableThemeUIController', () => {
    it('should emit refresh signal only for table custom theme updates', () => {
        const listeners: Array<(command: any) => void> = [];

        const controller = new SheetTableThemeUIController({
            onCommandExecuted: (listener: (command: any) => void) => {
                listeners.push(listener);
                return { dispose: vi.fn() };
            },
        } as any);

        const values: number[] = [];
        const subscription = controller.refreshTable$.subscribe((value) => values.push(value));

        listeners.forEach((listener) => listener({
            id: SetRangeThemeMutation.id,
            params: { styleName: 'table-custom-2026' },
        }));

        listeners.forEach((listener) => listener({
            id: SetRangeThemeMutation.id,
            params: { styleName: 'table-default-0' },
        }));

        expect(values.length).toBe(1);
        expect(typeof values[0]).toBe('number');

        subscription.unsubscribe();
        controller.dispose();
    });
});
