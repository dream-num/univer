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
    IUniverInstanceService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { DocMenuStyleService } from '../doc-menu-style.service';

function createService(): DocMenuStyleService {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ThemeService]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocMenuStyleService]);
    return injector.get(DocMenuStyleService);
}

describe('DocMenuStyleService', () => {
    it('merges cached text styles used by the next document input', () => {
        const service = createService();

        service.setStyleCache({ bl: 1 });
        service.setStyleCache({ it: 1 });

        expect(service.getStyleCache()).toEqual({ bl: 1, it: 1 });
    });

    it('uses body text defaults when there is no focused document render', () => {
        const service = createService();

        expect(service.getDefaultStyle()).toEqual({ ff: 'Arial', fs: 11 });
    });
});
