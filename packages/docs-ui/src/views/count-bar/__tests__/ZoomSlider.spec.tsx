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
    DocumentDataModel,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceService,
} from '@univerjs/core';
import { ComponentManager, IconManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { SetDocZoomRatioOperation } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import { ZoomSlider } from '../ZoomSlider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestLogService {
    debug(): void {}
    warn(): void {}
}

function createZoomSliderTestBed() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([LocaleService]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    const doc = new DocumentDataModel({
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

function renderZoomSlider() {
    const { injector, doc } = createZoomSliderTestBed();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <ZoomSlider />
            </RediContext.Provider>
        );
    });

    return { container, doc, root };
}

describe('ZoomSlider', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('applies toolbar zoom changes to the current document through the zoom operation', () => {
        const rendered = renderZoomSlider();
        root = rendered.root;
        container = rendered.container;

        const buttons = Array.from(container.querySelectorAll('button'));
        const increaseButton = buttons[2];

        act(() => {
            increaseButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(rendered.doc.zoomRatio).toBe(1.1);
    });
});
