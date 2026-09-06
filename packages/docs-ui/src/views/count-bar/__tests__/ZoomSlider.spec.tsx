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

/**
 * @vitest-environment jsdom
 */

import type { Root } from 'react-dom/client';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    DocumentDataModel,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    UniverInstanceService,
} from '@univerjs/core';
import { ComponentManager, IconManager, RediContext } from '@univerjs/ui';
import uiEnUS from '@univerjs/ui/locale/en-US';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { SetDocZoomRatioOperation } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import { ZoomSlider } from '../ZoomSlider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function createZoomSliderTestBed() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([LocaleService]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: uiEnUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');

    const doc = injector.createInstance(DocumentDataModel, {
        id: 'zoom-slider-doc',
        body: {
            dataStream: '\r\n',
            paragraphs: [],
            sectionBreaks: [],
            customRanges: [],
            tables: [],
            textRuns: [],
        },
    });

    (injector.get(IUniverInstanceService) as UniverInstanceService).__addUnit(doc);
    injector.get(ICommandService).registerCommand(SetDocZoomRatioOperation);

    return { injector, doc };
}

async function renderZoomSlider() {
    const { injector, doc } = createZoomSliderTestBed();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <ZoomSlider />
            </RediContext.Provider>
        );
    });

    return { container, doc, root, injector };
}

describe('ZoomSlider', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;
    let injector: Injector | undefined;

    afterEach(async () => {
        if (root) {
            await act(async () => root!.unmount());
        }
        injector?.dispose();
        container?.remove();
        root = undefined;
        container = undefined;
        injector = undefined;
    });

    it('applies toolbar zoom changes to the current document through the zoom operation', async () => {
        const rendered = await renderZoomSlider();
        root = rendered.root;
        container = rendered.container;
        injector = rendered.injector;

        const increaseButton = container.querySelector<HTMLButtonElement>('button[aria-label="Zoom in"]');
        expect(increaseButton).not.toBeNull();

        await act(async () => {
            increaseButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(rendered.doc.zoomRatio).toBe(1.1);
    });
});
