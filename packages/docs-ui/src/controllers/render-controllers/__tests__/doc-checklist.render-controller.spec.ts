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

import { CURSOR_TYPE } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ToggleCheckListCommand } from '../../../commands/commands/list.command';
import { DocChecklistRenderController } from '../doc-checklist.render-controller';

describe('DocChecklistRenderController', () => {
    it('toggles the clicked checklist paragraph with current text ranges', () => {
        const clickBullets$ = new Subject<any>();
        const controller = new DocChecklistRenderController(
            { mainComponent: { setCursor: vi.fn() } } as never,
            {} as never,
            { executeCommand: vi.fn() } as never,
            { clickBullets$, hoverBullet$: new Subject() } as never,
            { getTextRanges: vi.fn(() => [{ startOffset: 3, endOffset: 5 }]) } as never
        );

        clickBullets$.next({
            paragraph: { startIndex: 12 },
            segmentId: 'header-1',
        });

        expect((controller as any)._commandService.executeCommand).toHaveBeenCalledWith(ToggleCheckListCommand.id, {
            index: 12,
            segmentId: 'header-1',
            textRanges: [{ startOffset: 3, endOffset: 5 }],
        });

        controller.dispose();
    });

    it('switches the document cursor between pointer and text when hovering checklist bullets', () => {
        const hoverBullet$ = new Subject<any>();
        const setCursor = vi.fn();
        const controller = new DocChecklistRenderController(
            { mainComponent: { setCursor } } as never,
            {} as never,
            { executeCommand: vi.fn() } as never,
            { clickBullets$: new Subject(), hoverBullet$ } as never,
            { getTextRanges: vi.fn(() => []) } as never
        );

        hoverBullet$.next({ paragraph: { startIndex: 1 } });
        hoverBullet$.next(null);

        expect(setCursor).toHaveBeenNthCalledWith(1, CURSOR_TYPE.POINTER);
        expect(setCursor).toHaveBeenNthCalledWith(2, CURSOR_TYPE.TEXT);

        controller.dispose();
    });
});
