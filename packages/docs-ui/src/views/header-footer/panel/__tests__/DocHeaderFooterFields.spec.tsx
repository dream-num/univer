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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import {
    CustomRangeType,
    DocumentFlavor,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import designEnUS from '@univerjs/design/locale/en-US';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateChangeManagerService,
    DocStateEmitService,
    InsertTextCommand,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import {
    DesktopLayoutService,
    ILayoutService,
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    PlatformService,
    RediContext,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { InsertHeaderFooterFieldCommand } from '../../../../commands/commands/insert-header-footer-field.command';
import enUS from '../../../../locale/en-US';
import { DocMenuStyleService } from '../../../../services/doc-menu-style.service';
import { DocHeaderFooterFields } from '../DocHeaderFooterFields';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const cleanups: Array<() => void> = [];

async function renderFields(hostFocused = false) {
    const univer = new Univer();
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocStateEmitService]);
    injector.add([DocStateChangeManagerService]);
    injector.add([DocMenuStyleService]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'header-footer-fields-ui',
        body: { dataStream: 'Body\r\n', textRuns: [], paragraphs: [{ paragraphId: 'body-p', startIndex: 4 }] },
        headers: { header: { headerId: 'header', body: { dataStream: 'Header\r\n', textRuns: [], paragraphs: [{ paragraphId: 'header-p', startIndex: 6 }] } } },
        documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, defaultHeaderId: 'header', pageSize: { width: 300, height: 400 }, marginTop: 40 },
    });
    const instances = injector.get(IUniverInstanceService);
    instances.focusUnit(model.getUnitId());
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
    render.deactivate();
    render.addRenderDependencies([[DocSkeletonManagerService]]);
    render.with(DocSkeletonManagerService).getSkeleton().calculate();
    const commands = injector.get(ICommandService);
    for (const command of [InsertHeaderFooterFieldCommand, InsertTextCommand, RichTextEditingMutation, SetTextSelectionsOperation]) {
        commands.registerCommand(command);
    }
    injector.get(DocStateChangeManagerService);
    const selections = injector.get(DocSelectionManagerService);
    selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
    selections.__TEST_ONLY_add([{ startOffset: 6, endOffset: 6, collapsed: true, isActive: true, segmentId: 'header', segmentPage: 0 }]);
    const container = document.createElement('div');
    cleanups.push(() => container.remove());
    document.body.appendChild(container);
    const editor = document.createElement('textarea');
    container.appendChild(editor);
    const focusRequests: string[] = [];
    const focusHandler = injector.get(ILayoutService).registerFocusHandler(UniverInstanceType.UNIVER_DOC, (unitId) => {
        focusRequests.push(unitId);
        editor.focus();
    });
    cleanups.push(() => focusHandler.dispose());
    const mount = document.createElement('div');
    container.appendChild(mount);
    const root = createRoot(mount);
    cleanups.push(() => act(() => root.unmount()));
    await act(async () => root.render(
        <RediContext.Provider value={{ injector }}>
            <ConfigProvider locale={designEnUS.design} mountContainer={document.body}>
                <DocHeaderFooterFields unitId={model.getUnitId()} disabled={false} />
            </ConfigProvider>
        </RediContext.Provider>
    ));
    if (hostFocused) {
        const host = univer.createUnit(UniverInstanceType.UNIVER_SHEET, { id: 'header-fields-host' });
        instances.focusUnit(host.getUnitId());
    }
    editor.focus();
    await act(async () => button(mount, 'Date & time').click());
    return { univer, model, injector, container, editor, mount, focusRequests };
}

function button(container: ParentNode, text: string) {
    const result = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((item) => item.textContent === text);
    expect(result).toBeDefined();
    return result!;
}

async function settleFocus() {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
}

describe('DocHeaderFooterFields', () => {
    afterEach(async () => {
        cleanups.splice(0).reverse().forEach((dispose) => dispose());
        await settleFocus();
    });

    it.each(['Cancel', 'Close', 'Escape'])('returns focus to the header after %s', async (action) => {
        const { editor } = await renderFields();
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
        expect(dialog.contains(document.activeElement)).toBe(true);
        await act(async () => {
            if (action === 'Escape') {
                document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            } else {
                button(dialog, action === 'Cancel' ? designEnUS.design.Confirm.cancel : action).click();
            }
        });
        await settleFocus();
        expect(document.querySelector('[role="dialog"]')).toBeNull();
        expect(document.activeElement).toBe(editor);
    });

    it('opens the date format by keyboard, inserts the selected format and resumes editing', async () => {
        const { model, injector, editor } = await renderFields();
        const trigger = document.querySelector<HTMLButtonElement>('button[data-u-comp="select"]')!;
        expect(trigger.tagName).toBe('BUTTON');
        expect(trigger.getAttribute('aria-label')).toBe('Date & time');
        expect(document.querySelector('[role="dialog"]')!.contains(trigger)).toBe(true);
        await act(async () => {
            trigger.focus();
            trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });
        const longDate = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')).find((item) => item.textContent?.includes(','))!;
        expect(longDate).toBeDefined();
        const selectedDate = longDate.textContent;
        await act(async () => {
            longDate.focus();
            longDate.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });
        expect(trigger.textContent).toBe(selectedDate);
        await act(async () => button(document.querySelector('[role="dialog"]')!, designEnUS.design.Confirm.confirm).click());
        injector.get(DocStateChangeManagerService).flushPendingChanges(model.getUnitId());
        await settleFocus();
        const field = model.getSelfOrHeaderFooterModel('header')!.getBody()!.customRanges?.find((range) => range.rangeType === CustomRangeType.FIELD);
        expect(field?.properties?.cachedResult).toBe(selectedDate);
        expect(field?.properties?.instruction).toContain('MMMM');
        expect(document.activeElement).toBe(editor);
    });

    it('does not take focus from a document activated while the dialog was open', async () => {
        const { univer, injector, container, editor, focusRequests } = await renderFields();
        const other = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, { id: 'other-doc', body: { dataStream: '\r\n', textRuns: [] } });
        const otherEditor = document.createElement('textarea');
        container.appendChild(otherEditor);
        injector.get(IUniverInstanceService).focusUnit(other.getUnitId());
        const requestsBeforeClose = focusRequests.length;
        await act(async () => button(document.querySelector('[role="dialog"]')!, designEnUS.design.Confirm.cancel).click());
        otherEditor.focus();
        await settleFocus();
        expect(document.activeElement).toBe(otherEditor);
        expect(document.activeElement).not.toBe(editor);
        expect(focusRequests).toHaveLength(requestsBeforeClose);
    });

    it('restores the owning editor while the host keeps global unit focus', async () => {
        const { injector, editor } = await renderFields(true);
        await act(async () => button(document.querySelector('[role="dialog"]')!, designEnUS.design.Confirm.cancel).click());
        await settleFocus();
        expect(document.activeElement).toBe(editor);
        expect(injector.get(IUniverInstanceService).getFocusedUnit()?.getUnitId()).toBe('header-fields-host');
    });
});
