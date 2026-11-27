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

import type { Editor } from '@univerjs/docs-ui';
import { RegionService, Univer } from '@univerjs/core';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, onTestFinished } from 'vitest';
import { useFormulaEditorSyntax } from '../use-formula-editor-syntax';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function EmbeddedEditor({ editor, focused }: { editor: Editor; focused: boolean }) {
    const syntax = useFormulaEditorSyntax('validation', editor, focused);
    return <output>{syntax.argumentSeparator}</output>;
}

describe('useFormulaEditorSyntax', () => {
    it('keeps a focused validation draft in its original region and relocalizes it on blur', () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IEditorBridgeService, { useValue: {} as IEditorBridgeService }]);
        const regionService = injector.get(RegionService);
        regionService.setRegion('es-ES');
        let formula = '=SUM(1,5;2)';
        const editor = {
            getDocumentData: () => ({ body: { dataStream: `${formula}\r\n` } }),
            replaceText: (text: string) => { formula = text; },
        } as Editor;
        const container = document.createElement('div');
        const root = createRoot(container);
        onTestFinished(() => {
            act(() => root.unmount());
            univer.dispose();
        });
        const render = (focused: boolean) => act(() => root.render(
            <RediContext.Provider value={{ injector }}>
                <EmbeddedEditor editor={editor} focused={focused} />
            </RediContext.Provider>
        ));

        render(true);
        act(() => regionService.setRegion('en-US'));
        expect(container.textContent).toBe(';');
        expect(formula).toBe('=SUM(1,5;2)');
        render(false);
        expect(formula).toBe('=SUM(1.5,2)');
        expect(container.textContent).toBe(',');
    });
});
