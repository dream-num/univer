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

import type { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
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
import { IPlatformService, IShortcutService, PlatformService, ShortcutService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BaseSelectionRenderService } from '../base-selection-render.service';

class TestSelectionRenderService extends BaseSelectionRenderService {
    emitMoving() {
        this._selectionMoving$.next([]);
    }

    emitMoveEnd() {
        this._selectionMoveEnd$.next([]);
    }
}

describe('BaseSelectionRenderService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('tracks whether a sheet selection drag is moving', () => {
        vi.stubGlobal('window', new EventTarget());
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IShortcutService, { useClass: ShortcutService }]);
        injector.add([ThemeService]);
        const service = injector.createInstance(
            TestSelectionRenderService,
            injector,
            injector.get(ThemeService),
            injector.get(IShortcutService),
            {} as SheetSkeletonManagerService,
            injector.get(IContextService)
        );

        service.emitMoving();
        expect(service.selectionMoving).toBe(true);

        service.emitMoveEnd();
        expect(service.selectionMoving).toBe(false);
    });
});
