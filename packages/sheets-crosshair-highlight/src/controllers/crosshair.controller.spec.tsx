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

import { CrossHighlightingIcon } from '@univerjs/icons';
import { describe, expect, it, vi } from 'vitest';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SetCrosshairHighlightColorOperation,
    ToggleCrosshairHighlightOperation,
} from '../commands/operations/operation';
import { CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT } from '../menu/crosshair.menu';
import { menuSchema } from '../menu/schema';
import { CrosshairOverlay } from '../views/components/CrosshairHighlight';
import { ComponentsController } from './components.controller';
import { SheetsCrosshairHighlightController } from './crosshair.controller';

describe('SheetsCrosshairHighlightController', () => {
    it('should register commands and merge menu', () => {
        const registerCommand = vi.fn();
        const mergeMenu = vi.fn();

        const controller = new SheetsCrosshairHighlightController(
            { mergeMenu } as never,
            { registerCommand } as never
        );

        expect(registerCommand).toHaveBeenCalledWith(ToggleCrosshairHighlightOperation);
        expect(registerCommand).toHaveBeenCalledWith(SetCrosshairHighlightColorOperation);
        expect(registerCommand).toHaveBeenCalledWith(EnableCrosshairHighlightOperation);
        expect(registerCommand).toHaveBeenCalledWith(DisableCrosshairHighlightOperation);

        expect(mergeMenu).toHaveBeenCalledWith(menuSchema);
        expect(Object.keys(menuSchema).length).toBeGreaterThan(0);

        controller.dispose();
    });

    it('should register components and icons', () => {
        const registerComponent = vi.fn(() => ({ dispose: vi.fn() }));
        const registerIcon = vi.fn(() => ({ dispose: vi.fn() }));

        const controller = new ComponentsController(
            { register: registerComponent } as never,
            { register: registerIcon } as never
        );

        expect(registerComponent).toHaveBeenCalledWith(CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT, CrosshairOverlay);
        expect(registerIcon).toHaveBeenCalledWith({ CrossHighlightingIcon });

        controller.dispose();
    });
});
