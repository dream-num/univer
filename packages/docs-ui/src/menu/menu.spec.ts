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

import type { IAccessor } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EmbedRuntimeFocusCoordinator } from '@univerjs/embed-ui';
import { describe, expect, it, vi } from 'vitest';
import { AlignMenuItemFactory, getParagraphStyleAtCursor, shouldSuppressDocMenuStateRefresh } from './menu';

describe('docs-ui menu helpers', () => {
    it('ignores stale menu calculations after an embedded doc injector is disposed', () => {
        const error = new Error('[redi]: Injector cannot be accessed after it was disposed.');
        error.name = 'InjectorAlreadyDisposedError';
        const accessor = {
            get: vi.fn(() => {
                throw error;
            }),
        } as unknown as IAccessor;

        expect(getParagraphStyleAtCursor(accessor)).toBeUndefined();
    });

    it('suppresses host doc menu state refresh while an embedded child owns focus', () => {
        const getDocRanges = vi.fn(() => [{ startOffset: 0, endOffset: 0, isActive: true }]);
        const accessor = {
            get: vi.fn((token) => {
                if (token === IUniverInstanceService) {
                    return {
                        getCurrentUnitOfType: () => ({ getUnitId: () => 'host-doc' }),
                    };
                }
                if (token === EmbedRuntimeFocusCoordinator) {
                    return {
                        shouldSuppressHostInteraction: (unitId: string | undefined) => unitId === 'host-doc',
                    };
                }
                if (token === DocSelectionManagerService) {
                    return { getDocRanges };
                }
                throw new Error('Unexpected dependency');
            }),
        } as unknown as IAccessor;

        expect(shouldSuppressDocMenuStateRefresh(accessor)).toBe(true);
        expect(getParagraphStyleAtCursor(accessor)).toBeUndefined();
        expect(getDocRanges).not.toHaveBeenCalled();
    });

    it('keeps selector icons synchronous while suppressing host doc menu refresh', () => {
        const accessor = {
            get: vi.fn((token) => {
                if (token === ICommandService) {
                    return {
                        onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
                    };
                }
                if (token === IUniverInstanceService) {
                    return {
                        getCurrentUnitOfType: () => ({ getUnitId: () => 'host-doc' }),
                    };
                }
                if (token === EmbedRuntimeFocusCoordinator) {
                    return {
                        shouldSuppressHostInteraction: (unitId: string | undefined) => unitId === 'host-doc',
                    };
                }
                if (token === DocSelectionManagerService) {
                    return {
                        textSelection$: {
                            subscribe: () => ({ unsubscribe: vi.fn() }),
                        },
                    };
                }
                throw new Error('Unexpected dependency');
            }),
        } as unknown as IAccessor;

        const item = AlignMenuItemFactory(accessor);
        let icon: unknown;
        const subscription = (item.icon as { subscribe: (listener: (value: unknown) => void) => { unsubscribe: () => void } })
            .subscribe((value) => {
                icon = value;
            });

        expect(icon).toBe('LeftJustifyingIcon');
        subscription.unsubscribe();
    });
});
