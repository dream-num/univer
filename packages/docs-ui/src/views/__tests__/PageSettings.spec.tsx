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

import type { IConfirmChildrenProps } from '@univerjs/ui';
import {
    ContextService,
    DocumentDataModel,
    DocumentFlavor,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    PageOrientType,
    UniverInstanceService,
} from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { PageSettings } from '../PageSettings';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestLogService {
    debug(): void {}
}

function createPageSettingsTestBed() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([LocaleService, { useClass: LocaleService }]);

    injector.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            'docs-ui': {
                'page-settings': {
                    'modern-mode': 'Modern',
                    'classic-mode': 'Classic',
                    'modern-width': 'Modern width',
                    'modern-width-narrow': 'Narrow',
                    'modern-width-medium': 'Medium',
                    'modern-width-wide': 'Wide',
                    'paper-size': 'Paper size',
                    'custom-paper-size': 'Custom paper size',
                    top: 'Top',
                    bottom: 'Bottom',
                    left: 'Left',
                    right: 'Right',
                    'page-size': {
                        a4: 'A4',
                        letter: 'Letter',
                        legal: 'Legal',
                    },
                },
            },
        },
    });

    const doc = new DocumentDataModel({
        id: 'page-settings-doc',
        documentStyle: {
            documentFlavor: DocumentFlavor.MODERN,
            pageSize: { width: 720, height: 960 },
            pageOrient: PageOrientType.PORTRAIT,
            marginTop: 24,
            marginBottom: 28,
            marginLeft: 32,
            marginRight: 36,
        },
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

    return { injector };
}

function renderPageSettings(hooks: IConfirmChildrenProps['hooks']) {
    const { injector } = createPageSettingsTestBed();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <PageSettings hooks={hooks} />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function clickButton(container: HTMLElement, text: string) {
    const button = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes(text));
    if (!button) {
        throw new Error(`Missing button: ${text}`);
    }

    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

// describe('PageSettings', () => {
//     let root: Root | undefined;
//     let container: HTMLElement | undefined;

//     afterEach(() => {
//         if (root) {
//             act(() => root!.unmount());
//         }
//         container?.remove();
//         root = undefined;
//         container = undefined;
//     });

//     it('returns the selected page mode and modern width through confirm hooks', () => {
//         const hooks: IConfirmChildrenProps['hooks'] = {};
//         const rendered = renderPageSettings(hooks);
//         root = rendered.root;
//         container = rendered.container;

//         act(() => clickButton(container!, 'Wide'));
//         expect(hooks.beforeConfirm?.()).toMatchObject({
//             mode: DocumentFlavor.MODERN,
//             modernWidth: ModernDocumentWidthMode.WIDE,
//             pageSize: { width: 720, height: 960 },
//             margins: {
//                 top: 24,
//                 bottom: 28,
//                 left: 32,
//                 right: 36,
//             },
//         });

//         act(() => clickButton(container!, 'Classic'));
//         expect(hooks.beforeClose?.()).toMatchObject({
//             mode: DocumentFlavor.TRADITIONAL,
//             paperSize: 'A4',
//             pageSize: { width: 720, height: 960 },
//         });
//     });
// });
