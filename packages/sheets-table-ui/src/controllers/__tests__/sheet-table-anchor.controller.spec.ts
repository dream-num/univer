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

import { SetScrollOperation, SetZoomRatioOperation } from '@univerjs/sheets-ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetTableAnchorController } from '../sheet-table-anchor.controller';

describe('SheetTableAnchorController', () => {
    it('should register anchor UI and toggle anchor visibility on scroll/zoom commands', () => {
        vi.useFakeTimers();

        const commandListeners: Array<(command: any) => void> = [];
        const registerComponent = vi.fn(() => ({ dispose: vi.fn() }));

        const controller = new SheetTableAnchorController(
            {
                unitId: 'u1',
                unit: {
                    getUnitId: () => 'u1',
                    activeSheet$: new BehaviorSubject({ getSheetId: () => 's1' }),
                    getActiveSheet: () => ({ getSheetId: () => 's1' }),
                },
            } as any,
            {} as any,
            {
                currentSkeleton$: new Subject(),
            } as any,
            {
                getRenderById: () => null,
            } as any,
            {
                onCommandExecuted: (listener: (command: any) => void) => {
                    commandListeners.push(listener);
                    return { dispose: vi.fn() };
                },
            } as any,
            {} as any,
            {
                registerComponent,
            } as any,
            {
                tableAdd$: new Subject(),
                tableDelete$: new Subject(),
                tableNameChanged$: new Subject(),
                tableRangeChanged$: new Subject(),
                tableThemeChanged$: new Subject(),
                getTableList: () => [],
            } as any,
            {
                validViewportScrollInfo$: new Subject(),
            } as any,
            {
                unitPermissionInitStateChange$: new Subject(),
            } as any,
            {
                permissionPointUpdate$: new Subject(),
                getPermissionPoint: vi.fn(() => ({ value: true })),
            } as any
        );

        expect(registerComponent).toHaveBeenCalledTimes(1);

        commandListeners.forEach((listener) => listener({ id: SetZoomRatioOperation.id }));
        expect((controller as any)._anchorVisible$.getValue()).toBe(false);

        vi.advanceTimersByTime(300);
        expect((controller as any)._anchorVisible$.getValue()).toBe(true);

        commandListeners.forEach((listener) => listener({ id: SetScrollOperation.id }));
        expect((controller as any)._anchorVisible$.getValue()).toBe(false);

        vi.advanceTimersByTime(300);
        expect((controller as any)._anchorVisible$.getValue()).toBe(true);

        controller.dispose();
        vi.useRealTimers();
    });
});
