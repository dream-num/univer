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

import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { DocLayoutInteractionService } from '../../../services/doc-layout-interaction.service';
import { DocCanvasPopupLayoutInteractionController } from '../doc-canvas-popup-layout-interaction.controller';

describe('DocCanvasPopupLayoutInteractionController', () => {
    it('holds the layout interaction while its render unit owns a popup', () => {
        const popupUnits$ = new BehaviorSubject<ReadonlySet<string>>(new Set());
        const interactionService = new DocLayoutInteractionService();
        const controller = new DocCanvasPopupLayoutInteractionController(
            { unitId: 'doc-1' },
            { popupUnits$ },
            interactionService
        );

        popupUnits$.next(new Set(['doc-2']));
        expect(interactionService.isActive).toBe(false);

        popupUnits$.next(new Set(['doc-1', 'doc-2']));
        expect(interactionService.isActive).toBe(true);

        popupUnits$.next(new Set(['doc-1']));
        expect(interactionService.isActive).toBe(true);

        popupUnits$.next(new Set());
        expect(interactionService.isActive).toBe(false);

        controller.dispose();
        interactionService.dispose();
        popupUnits$.complete();
    });

    it('releases the layout interaction when its render controller is disposed', () => {
        const popupUnits$ = new BehaviorSubject<ReadonlySet<string>>(new Set(['doc-1']));
        const interactionService = new DocLayoutInteractionService();
        const controller = new DocCanvasPopupLayoutInteractionController(
            { unitId: 'doc-1' },
            { popupUnits$ },
            interactionService
        );

        expect(interactionService.isActive).toBe(true);

        controller.dispose();
        expect(interactionService.isActive).toBe(false);
        interactionService.dispose();
        popupUnits$.complete();
    });
});
