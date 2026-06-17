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

import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    ThemeService,
} from '@univerjs/core';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS, SheetsCrosshairHighlightService } from '../../services/crosshair.service';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SetCrosshairHighlightColorOperation,
    ToggleCrosshairHighlightOperation,
} from './operation';

function createOperationTestBed() {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ThemeService]);
    injector.add([SheetsCrosshairHighlightService]);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(ToggleCrosshairHighlightOperation);
    commandService.registerCommand(EnableCrosshairHighlightOperation);
    commandService.registerCommand(DisableCrosshairHighlightOperation);
    commandService.registerCommand(SetCrosshairHighlightColorOperation);

    const themeService = injector.get(ThemeService);
    const highlightBackground: Array<{ color: string; alpha: number }> = [];
    for (let index = 0; index < CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS.length; index++) {
        highlightBackground.push({
            color: index === 2 ? '#00ff00' : '#ff0000',
            alpha: index === 2 ? 0.5 : 1,
        });
    }

    themeService.setTheme({
        ...themeService.getCurrentTheme(),
        highlight: {
            background: highlightBackground,
        },
    } as never);

    return {
        commandService,
        service: injector.get(SheetsCrosshairHighlightService),
    };
}

describe('crosshair highlight operations', () => {
    let commandService: ICommandService;
    let service: SheetsCrosshairHighlightService;

    beforeEach(() => {
        const testBed = createOperationTestBed();
        commandService = testBed.commandService;
        service = testBed.service;
    });

    it('toggles crosshair highlighting for the current sheet view', async () => {
        expect(service.enabled).toBe(false);

        await commandService.executeCommand(ToggleCrosshairHighlightOperation.id);
        expect(service.enabled).toBe(true);

        await commandService.executeCommand(ToggleCrosshairHighlightOperation.id);
        expect(service.enabled).toBe(false);
    });

    it('reports whether explicit enable and disable commands actually changed the state', async () => {
        await expect(commandService.executeCommand(EnableCrosshairHighlightOperation.id)).resolves.toBe(true);
        await expect(commandService.executeCommand(EnableCrosshairHighlightOperation.id)).resolves.toBe(false);
        expect(service.enabled).toBe(true);

        await expect(commandService.executeCommand(DisableCrosshairHighlightOperation.id)).resolves.toBe(true);
        await expect(commandService.executeCommand(DisableCrosshairHighlightOperation.id)).resolves.toBe(false);
        expect(service.enabled).toBe(false);
    });

    it('enables crosshair highlighting when the user chooses a highlight color', async () => {
        const result = await commandService.executeCommand(SetCrosshairHighlightColorOperation.id, {
            value: CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS[1],
        });

        expect(result).toBe(true);
        expect(service.enabled).toBe(true);
        await expect(firstValueFrom(service.color$)).resolves.toBe('rgba(0,255,0,0.5)');
    });
});
