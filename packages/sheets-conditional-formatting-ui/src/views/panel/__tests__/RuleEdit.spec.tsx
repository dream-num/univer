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

import type { IDisposable, IDocumentData, IRange } from '@univerjs/core';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import type { Root } from 'react-dom/client';
import { BooleanNumber, createIdentifier, LocaleService, LocaleType, toDisposable } from '@univerjs/core';
import { FunctionService, IFunctionService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { AddCfCommand, CFRuleType, CFSubRuleType, CFTextOperator, SetCfCommand } from '@univerjs/sheets-conditional-formatting';
import { DescriptionService, IDescriptionService } from '@univerjs/sheets-formula';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import {
    ILayoutService,
    IPlatformService,
    IShortcutService,
    PlatformService,
    RediContext,
    ShortcutService,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../../__tests__/create-cf-ui-test-bed';
import { RuleEdit } from '../RuleEdit';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ACTIVE_RANGE: IRange = {
    startRow: 0,
    endRow: 0,
    startColumn: 0,
    endColumn: 0,
};

const EXISTING_RANGE: IRange = {
    startRow: 1,
    endRow: 1,
    startColumn: 1,
    endColumn: 1,
};

class TestLayoutService {
    readonly rootContainerElement = document.body;
}

class TestRenderManagerService {
    getRenderById() {
        return undefined;
    }
}

class TestMarkSelectionService {
    addShape() {
        return 'shape-id';
    }

    removeShape() {
        // No canvas layer is created for these view tests.
    }
}

const IEditorService = createIdentifier<TestEditorService>('univer.editor.service');

class TestRangeEditor {
    readonly blur$ = new Subject<void>();
    readonly focus$ = new Subject<void>();
    readonly input$ = new Subject<void>();
    readonly selectionChange$ = new Subject<void>();

    private _data: IDocumentData;
    private readonly _change$ = new Subject<void>();

    readonly render = {
        isDisposed: () => true,
    };

    constructor(private readonly _editorId: string, initialSnapshot: IDocumentData) {
        this._data = initialSnapshot;
    }

    getEditorId() {
        return this._editorId;
    }

    getDocumentData() {
        return this._data;
    }

    setDocumentData(data: IDocumentData) {
        this._data = data;
        this._change$.next();
    }

    getDocumentDataModel() {
        return {
            change$: this._change$.asObservable(),
            getPlainText: () => this._getPlainText(),
        };
    }

    replaceText(text: string) {
        this._data = {
            ...this._data,
            body: {
                ...this._data.body,
                dataStream: `${text}\r\n`,
            },
        };
        this._change$.next();
        this.input$.next();
    }

    setSelectionRanges() {
        this.selectionChange$.next();
    }

    getSelectionRanges() {
        return [];
    }

    focus() {
        this.focus$.next();
    }

    blur() {
        this.blur$.next();
    }

    isSheetEditor() {
        return false;
    }

    getBoundingClientRect() {
        return { width: 0, height: 0 };
    }

    private _getPlainText() {
        return this._data.body?.dataStream.replace(/\r\n$/, '') ?? '';
    }
}

class TestEditorService {
    private readonly _editors = new Map<string, TestRangeEditor>();
    private _focusId: string | undefined;

    readonly blur$ = new Subject<void>();
    readonly focus$ = new Subject<{ unitId: string }>();

    register(config: { editorUnitId: string; initialSnapshot: IDocumentData }): IDisposable {
        this._editors.set(config.editorUnitId, new TestRangeEditor(config.editorUnitId, config.initialSnapshot));

        return toDisposable(() => {
            this._editors.delete(config.editorUnitId);
        });
    }

    getEditor(id?: string) {
        return id ? this._editors.get(id) : this.getFocusEditor();
    }

    getAllEditor() {
        return this._editors;
    }

    isEditor(editorUnitId: string) {
        return this._editors.has(editorUnitId);
    }

    getEditorRenderConfig() {
        return null;
    }

    isSheetEditor() {
        return false;
    }

    blur() {
        this._focusId = undefined;
        this.blur$.next();
    }

    focus(editorUnitId: string) {
        this._focusId = editorUnitId;
        this.focus$.next({ unitId: editorUnitId });
    }

    getFocusId() {
        return this._focusId;
    }

    getFocusEditor() {
        return this._focusId ? this._editors.get(this._focusId) : null;
    }
}

function createRuleEditTestBed() {
    const testBed = createCfUiTestBed();

    testBed.injector.add([IEditorService, { useClass: TestEditorService }]);
    testBed.injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    testBed.injector.add([LexerTreeBuilder]);
    testBed.injector.add([IFunctionService, { useClass: FunctionService }]);
    testBed.injector.add([IDescriptionService, { useClass: DescriptionService }]);
    testBed.injector.add([IMarkSelectionService, { useClass: TestMarkSelectionService as never }]);
    testBed.injector.add([IPlatformService, { useClass: PlatformService }]);
    testBed.injector.add([IShortcutService, { useClass: ShortcutService }]);
    testBed.injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    testBed.commandService.registerCommand(AddCfCommand);
    testBed.commandService.registerCommand(SetCfCommand);
    testBed.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            'sheets-conditional-formatting-ui': {
                panel: {
                    range: 'Range',
                    styleType: 'Style type',
                    styleRule: 'Rule',
                    submit: 'Submit',
                    cancel: 'Cancel',
                },
                ruleType: {
                    highlightCell: 'Highlight cell',
                    dataBar: 'Data bar',
                    colorScale: 'Color scale',
                    formula: 'Formula',
                    iconSet: 'Icon set',
                },
                subRuleType: {
                    text: 'Text',
                    number: 'Number',
                    timePeriod: 'Time period',
                    duplicateValues: 'Duplicate values',
                    uniqueValues: 'Unique values',
                },
                operator: {
                    containsText: 'Contains text',
                    notContainsText: 'Does not contain text',
                    beginsWith: 'Begins with',
                    endsWith: 'Ends with',
                    equal: 'Equal',
                    notEqual: 'Not equal',
                    containsBlanks: 'Contains blanks',
                    notContainsBlanks: 'Does not contain blanks',
                    containsErrors: 'Contains errors',
                    notContainsErrors: 'Does not contain errors',
                    between: 'Between',
                    notBetween: 'Not between',
                    greaterThan: 'Greater than',
                    greaterThanOrEqual: 'Greater than or equal',
                    lessThan: 'Less than',
                    lessThanOrEqual: 'Less than or equal',
                },
                errorMessage: {
                    notBlank: 'Required',
                    rangeError: 'Invalid range',
                },
            },
        },
    });

    return testBed;
}

function createTextRule(cfId: string, range: IRange, value: string): IConditionFormattingRule {
    return {
        cfId,
        ranges: [range],
        stopIfTrue: false,
        rule: {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            operator: CFTextOperator.containsText,
            value,
            style: {
                bl: BooleanNumber.TRUE,
            },
        },
    };
}

function inputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function waitForEditorEffects() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await Promise.resolve();
    });
}

function getConditionInput(container: HTMLDivElement) {
    const inputs = Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[];
    return inputs.find((input) => input.value === '') ?? inputs.at(-1);
}

async function clickSubmit(container: HTMLDivElement) {
    const submitButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Submit');

    expect(submitButton).toBeDefined();

    await act(async () => {
        submitButton!.click();
        await Promise.resolve();
    });
}

describe('RuleEdit', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createRuleEditTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('creates a text highlight conditional formatting rule for the current sheet selection', async () => {
        currentTestBed = createRuleEditTestBed();
        currentTestBed.setSelection(ACTIVE_RANGE);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let cancelCount = 0;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleEdit onCancel={() => { cancelCount += 1; }} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });
        await waitForEditorEffects();

        const conditionInput = getConditionInput(container);

        expect(conditionInput).toBeDefined();

        await act(async () => {
            inputText(conditionInput!, 'overdue');
            await Promise.resolve();
        });
        await clickSubmit(container);

        const rules = currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId);

        expect(rules).toHaveLength(1);
        expect(cancelCount).toBe(1);
        expect(rules?.[0]).toMatchObject({
            ranges: [ACTIVE_RANGE],
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.containsText,
                value: 'overdue',
            },
        });
    });

    it('updates an existing rule without creating a second conditional formatting rule', async () => {
        currentTestBed = createRuleEditTestBed();
        const existingRule = createTextRule('cf-existing', EXISTING_RANGE, 'old');

        await currentTestBed.commandService.executeCommand(AddCfCommand.id, {
            unitId: currentTestBed.unitId,
            subUnitId: currentTestBed.subUnitId,
            rule: existingRule,
        });

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let cancelCount = 0;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleEdit
                        rule={existingRule}
                        onCancel={() => { cancelCount += 1; }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });
        await waitForEditorEffects();

        const conditionInput = getConditionInput(container);

        expect(conditionInput).toBeDefined();

        await act(async () => {
            inputText(conditionInput!, 'updated');
            await Promise.resolve();
        });
        await clickSubmit(container);

        const rules = currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId);

        expect(rules).toHaveLength(1);
        expect(cancelCount).toBe(1);
        expect(rules?.[0]).toMatchObject({
            cfId: 'cf-existing',
            ranges: [EXISTING_RANGE],
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.text,
                operator: CFTextOperator.containsText,
                value: 'updated',
            },
        });
    });
});
