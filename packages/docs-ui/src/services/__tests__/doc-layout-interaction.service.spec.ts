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
import { DocLayoutInteractionService } from '../doc-layout-interaction.service';

describe('DocLayoutInteractionService', () => {
    it('keeps the render protected until every overlapping interaction ends', () => {
        const service = new DocLayoutInteractionService();
        const activeStates: boolean[] = [];
        service.active$.subscribe((active) => activeStates.push(active));

        const menuInteraction = service.beginInteraction();
        const dragInteraction = service.beginInteraction();
        menuInteraction.dispose();
        menuInteraction.dispose();

        expect(service.isActive).toBe(true);
        expect(activeStates).toEqual([false, true]);

        dragInteraction.dispose();

        expect(service.isActive).toBe(false);
        expect(activeStates).toEqual([false, true, false]);
    });

    it('releases active interactions when the render is disposed', () => {
        const service = new DocLayoutInteractionService();
        const complete = vi.fn();
        service.active$.subscribe({ complete });
        service.beginInteraction();

        service.dispose();

        expect(service.isActive).toBe(false);
        expect(complete).toHaveBeenCalledTimes(1);
    });
});
