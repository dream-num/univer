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
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    UniverInstanceService,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { ComponentManager } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { DocCanvasPopManagerService } from '../doc-popup-manager.service';
import { DocFloatMenuService } from '../float-menu.service';
import { DocSelectionRenderService } from '../selection/doc-selection-render.service';

class InertDocCanvasPopManagerService {
    attachPopupToRange() {
        throw new Error('Internal editors should not attach float menu popups.');
    }
}

class InertDocSelectionRenderService {
    onSelectionStart$ = new Subject().asObservable();
}

const InertDocCanvasPopManagerServiceCtor = InertDocCanvasPopManagerService as unknown as typeof DocCanvasPopManagerService;
const InertDocSelectionRenderServiceCtor = InertDocSelectionRenderService as unknown as typeof DocSelectionRenderService;

describe('DocFloatMenuService', () => {
    it('does not register or show a floating toolbar inside internal document editors', () => {
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocCanvasPopManagerService, { useClass: InertDocCanvasPopManagerServiceCtor }]);
        injector.add([ComponentManager]);
        injector.add([DocSelectionRenderService, { useClass: InertDocSelectionRenderServiceCtor }]);

        const service = injector.createInstance(DocFloatMenuService, { unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY } as never);

        expect(service.floatMenu).toBeNull();
        expect(injector.get(ComponentManager).get('univer.doc.float-menu')).toBeUndefined();
    });
});
