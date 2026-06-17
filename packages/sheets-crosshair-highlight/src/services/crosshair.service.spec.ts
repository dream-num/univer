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

import { Injector, ThemeService } from '@univerjs/core';
import { firstValueFrom, skip, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS, SheetsCrosshairHighlightService } from './crosshair.service';

function createService(): { service: SheetsCrosshairHighlightService; themeService: ThemeService } {
    const injector = new Injector();
    injector.add([ThemeService]);
    injector.add([SheetsCrosshairHighlightService]);
    return {
        service: injector.get(SheetsCrosshairHighlightService),
        themeService: injector.get(ThemeService),
    };
}

describe('SheetsCrosshairHighlightService', () => {
    it('tracks enabled state and resolves selected highlight colors from theme tokens', async () => {
        const { service, themeService } = createService();
        themeService.setTheme({
            ...themeService.getCurrentTheme(),
            highlight: {
                background: CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS.map((_path, index) => ({
                    color: index === 2 ? '#00ff00' : '#ff0000',
                    alpha: index === 2 ? 0.5 : 1,
                })),
            },
        } as never);

        const enabled = firstValueFrom(service.enabled$.pipe(skip(1), take(1)));
        service.setEnabled(true);

        expect(service.enabled).toBe(true);
        await expect(enabled).resolves.toBe(true);

        service.setColor(CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS[1]);
        await expect(firstValueFrom(service.color$)).resolves.toBe('rgba(0,255,0,0.5)');
    });
});
