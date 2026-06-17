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
    ContextService,
    DesktopLogService,
    DocumentFlavor,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { DocsRenderService, getDocsCanvasBackgroundColor } from '../docs-render.service';

function createService(): DocsRenderService {
    const injector = new Injector();
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([ThemeService]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([DocsRenderService]);
    return injector.get(DocsRenderService);
}

describe('DocsRenderService', () => {
    it('can start render lifecycle listening when there are no existing docs', () => {
        const service = createService();

        expect(() => service.dispose()).not.toThrow();
    });

    it('uses document flavor to choose the doc canvas background', () => {
        expect(getDocsCanvasBackgroundColor(DocumentFlavor.MODERN)).toBe('#fff');
        expect(getDocsCanvasBackgroundColor(DocumentFlavor.TRADITIONAL)).toBe('#fafafa');
        expect(getDocsCanvasBackgroundColor()).toBe('#fafafa');
    });
});
