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

import type { IConditionalFormattingRuleConfig } from '@univerjs/sheets-conditional-formatting';
import { createIdentifier, InterceptorManager, LocaleService, LocaleType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService } from '@univerjs/sheets';
import { IContextMenuService, IDialogService, ILayoutService, IShortcutService } from '@univerjs/ui';
import { of, Subject } from 'rxjs';
import { createCfUiTestBed } from '../../../../__tests__/create-cf-ui-test-bed';
import enUS from '../../../../locale/en-US';
import { beforeSubmit, submit } from '../type';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const IEditorService = createIdentifier<TestEditorService>('univer.editor.service');
const IDescriptionService = createIdentifier<TestDescriptionService>('formula.description-service');

class TestLayoutService {
    readonly rootContainerElement = document.body;
}

class TestEditorService {
    register() {
        return { dispose() {} };
    }

    getEditor() {
        return undefined;
    }

    getFocusId() {
        return undefined;
    }

    focus(): void {}

    blur(): void {}
}

class TestRenderManagerService {
    getRenderUnitById() {
        return undefined;
    }
}

class TestDocSelectionManagerService {
    readonly textSelection$ = new Subject();
}

class TestDescriptionService {
    hasDefinedNameDescription() {
        return false;
    }
}

class TestDialogService {
    open() {
        return { dispose: () => {} };
    }

    close(): void {}

    closeAll(): void {}

    getDialogs$() {
        return of([]);
    }
}

class TestRefSelectionsService {
    setSelections(): void {}

    clear(): void {}
}

class TestShortcutService {
    registerShortcut() {
        return { dispose() {} };
    }
}

class TestContextMenuService {
    disable(): void {}

    enable(): void {}
}

export function createEditorTestBed() {
    const testBed = createCfUiTestBed();
    testBed.injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    testBed.injector.add([IEditorService, { useClass: TestEditorService as never }]);
    testBed.injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    testBed.injector.add([IDescriptionService, { useClass: TestDescriptionService as never }]);
    testBed.injector.add([IDialogService, { useClass: TestDialogService }]);
    testBed.injector.add([IRefSelectionsService, { useClass: TestRefSelectionsService as never }]);
    testBed.injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    testBed.injector.add([IContextMenuService, { useClass: TestContextMenuService as never }]);
    testBed.injector.add([LexerTreeBuilder]);
    testBed.get(LocaleService).load({ [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: {} });

    return testBed;
}

export function createFormulaEditorTestBed() {
    const testBed = createEditorTestBed();
    testBed.injector.add([DocSelectionManagerService, { useClass: TestDocSelectionManagerService as never }]);

    return testBed;
}

export function createRuleInterceptorManager() {
    return new InterceptorManager({ beforeSubmit, submit });
}

export function submitRule(interceptorManager: ReturnType<typeof createRuleInterceptorManager>) {
    return interceptorManager.fetchThroughInterceptors(submit)(null, null) as IConditionalFormattingRuleConfig | null;
}

export function inputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

export async function selectOption(selectIndex: number, optionText: string) {
    const select = Array.from(document.querySelectorAll<HTMLElement>('[data-u-comp="select"]'))[selectIndex];
    select.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    select.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    const option = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"], [role="menuitemradio"]'))
        .find((item) => item.textContent?.includes(optionText));

    if (!option) {
        throw new Error(`Rule editor option ${optionText} was not rendered`);
    }

    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

export async function openDropdown(dropdownIndex: number) {
    const dropdown = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="popover-trigger"]'))[dropdownIndex];
    if (!dropdown) {
        throw new Error(`Dropdown ${dropdownIndex} was not rendered`);
    }

    dropdown.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    dropdown.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
}
