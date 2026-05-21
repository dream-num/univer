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

import { config, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocHyperLinkEventRenderController } from '../hyper-link-event.render-controller';

describe('DocHyperLinkEventRenderController', () => {
    it('ignores hover ranges when the current selection has no text ranges', async () => {
        const hoverCustomRanges$ = new Subject<unknown[]>();
        const clickCustomRanges$ = new Subject<unknown>();
        const onUnhandledError = vi.fn();
        const previousUnhandledError = config.onUnhandledError;
        const commandService = {
            executeCommand: vi.fn(),
        };
        config.onUnhandledError = onUnhandledError;

        try {
            const controller = new DocHyperLinkEventRenderController(
                { unitId: 'doc-unit' } as never,
                { hoverCustomRanges$, clickCustomRanges$ } as never,
                commandService as never,
                { showing: false } as never,
                { getSkeleton: vi.fn() } as never,
                { getTextRanges: () => [] } as never
            );

            hoverCustomRanges$.next([]);
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(onUnhandledError).not.toHaveBeenCalled();
            expect(commandService.executeCommand).not.toHaveBeenCalled();

            controller.dispose();
        } finally {
            config.onUnhandledError = previousUnhandledError;
        }
    });
});
