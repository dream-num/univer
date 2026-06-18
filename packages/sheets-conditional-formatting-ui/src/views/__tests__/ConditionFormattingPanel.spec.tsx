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

import type { IRange } from '@univerjs/core';
import type { IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import type { Root } from 'react-dom/client';
import { BooleanNumber, createIdentifier, LocaleService, LocaleType } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { AddCfCommand, CFNumberOperator, CFRuleType, CFSubRuleType, SetCfCommand } from '@univerjs/sheets-conditional-formatting';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { IShortcutService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingI18nController } from '../../controllers/cf.i18n.controller';
import { ConditionFormattingPanel } from '../ConditionFormattingPanel';
import { RuleEdit } from '../panel/RuleEdit';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ACTIVE_RANGE: IRange = {
    startRow: 0,
    endRow: 0,
    startColumn: 0,
    endColumn: 0,
};

const IEditorService = createIdentifier<TestEditorService>('univer.editor.service');
const IDescriptionService = createIdentifier<TestDescriptionService>('formula.description-service');

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
    getRenderById() {
        return undefined;
    }
}

class TestShortcutService {
    registerShortcut() {
        return { dispose() {} };
    }
}

class TestMarkSelectionService {
    addShape() {
        return 'shape-id';
    }

    removeShape(): void {}
}

class TestDescriptionService {
    hasDefinedNameDescription() {
        return false;
    }
}

function createNumberHighlightRule(cfId: string, value: number): IConditionFormattingRule {
    return {
        cfId,
        ranges: [ACTIVE_RANGE],
        stopIfTrue: false,
        rule: {
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.number,
            operator: CFNumberOperator.greaterThan,
            value,
            style: {
                bl: BooleanNumber.TRUE,
            },
        },
    };
}

function createPanelTestBed() {
    const testBed = createCfUiTestBed();
    testBed.injector.add([ConditionalFormattingI18nController]);
    testBed.injector.add([IEditorService, { useClass: TestEditorService as never }]);
    testBed.injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    testBed.injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    testBed.injector.add([IMarkSelectionService, { useClass: TestMarkSelectionService as never }]);
    testBed.injector.add([IDescriptionService, { useClass: TestDescriptionService as never }]);
    testBed.injector.add([LexerTreeBuilder]);
    testBed.commandService.registerCommand(AddCfCommand);
    testBed.commandService.registerCommand(SetCfCommand);
    testBed.commandService.registerCommand(SetWorksheetActiveOperation);
    testBed.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            'sheets-conditional-formatting-ui': {
                panel: {
                    managerRuleSelect: 'Show {0}',
                    workSheet: 'Worksheet',
                    selectedRange: 'Selected range',
                    createRule: 'Create rule',
                    clear: 'Clear rules',
                    range: 'Range',
                    styleType: 'Style type',
                    styleRule: 'Style rule',
                    submit: 'Submit',
                    cancel: 'Cancel',
                },
                operator: {
                    containsText: 'Contains text',
                    notContainsText: 'Does not contain text',
                    beginsWith: 'Begins with',
                    endsWith: 'Ends with',
                    equal: 'Equals',
                    notEqual: 'Does not equal',
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
                subRuleType: {
                    text: 'Text',
                    number: 'Number',
                    timePeriod: 'Date',
                    duplicateValues: 'Duplicate values',
                    uniqueValues: 'Unique values',
                },
                ruleType: {
                    highlightCell: 'Highlight cell',
                },
                preview: {
                    describe: {
                        greaterThan: 'Greater than {0}',
                        containsText: 'Contains {0}',
                    },
                },
                errorMessage: {
                    notBlank: 'Required',
                    rangeError: 'Select a range',
                },
            },
        },
    });
    testBed.setSelection(ACTIVE_RANGE);

    return testBed;
}

function writeInput(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function clickButton(container: HTMLElement, text: string) {
    const button = Array.from(container.querySelectorAll('button'))
        .find((item) => item.textContent === text) as HTMLButtonElement | undefined;
    if (!button) {
        throw new Error(`Button was not rendered: ${text}`);
    }
    button.click();
}

describe('ConditionFormattingPanel and RuleEdit', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createPanelTestBed> | undefined;

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

    it('adds a text highlight rule to the active selection from the rule editor', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let cancelRequests = 0;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleEdit
                        onCancel={() => {
                            cancelRequests += 1;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;

        await act(async () => {
            writeInput(textInput, 'overdue');
            await Promise.resolve();
        });

        await act(async () => {
            clickButton(container!, 'Submit');
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)).toEqual([
            expect.objectContaining({
                ranges: [expect.objectContaining(ACTIVE_RANGE)],
                stopIfTrue: false,
                rule: expect.objectContaining({
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.text,
                    value: 'overdue',
                }),
            }),
        ]);
        expect(cancelRequests).toBe(1);
    });

    it('keeps the rule editor open and does not add a rule when the required condition input is empty', async () => {
        currentTestBed = createPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let cancelRequests = 0;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleEdit
                        onCancel={() => {
                            cancelRequests += 1;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await act(async () => {
            clickButton(container!, 'Submit');
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId) ?? []).toEqual([]);
        expect(cancelRequests).toBe(0);
        expect(container.textContent).toContain('Style rule');
    });

    it('saves changes to an existing number highlight rule without replacing its identity', async () => {
        currentTestBed = createPanelTestBed();
        const originalRule = {
            ...createNumberHighlightRule('cf-active', 10),
            stopIfTrue: true,
        };
        await currentTestBed.commandService.executeCommand(AddCfCommand.id, {
            unitId: currentTestBed.unitId,
            subUnitId: currentTestBed.subUnitId,
            rule: originalRule,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let cancelRequests = 0;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleEdit
                        rule={originalRule}
                        onCancel={() => {
                            cancelRequests += 1;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const numberInput = Array.from(container.querySelectorAll('input'))
            .find((input) => input.value === '10') as HTMLInputElement | undefined;
        if (!numberInput) {
            throw new Error('Number condition input was not rendered');
        }

        await act(async () => {
            writeInput(numberInput, '25');
            await Promise.resolve();
        });

        await act(async () => {
            clickButton(container!, 'Submit');
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)).toEqual([
            expect.objectContaining({
                cfId: 'cf-active',
                ranges: [expect.objectContaining(ACTIVE_RANGE)],
                stopIfTrue: true,
                rule: expect.objectContaining({
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    operator: CFNumberOperator.greaterThan,
                    value: 25,
                }),
            }),
        ]);
        expect(cancelRequests).toBe(1);
    });

    it('opens the clicked worksheet rule for editing and returns to the manager without changing it', async () => {
        currentTestBed = createPanelTestBed();
        await currentTestBed.commandService.executeCommand(AddCfCommand.id, {
            unitId: currentTestBed.unitId,
            subUnitId: currentTestBed.subUnitId,
            rule: createNumberHighlightRule('cf-active', 10),
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <ConditionFormattingPanel />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const rangeText = Array.from(container.querySelectorAll('div'))
            .find((element) => element.textContent === 'A1');
        const ruleRow = rangeText?.parentElement?.parentElement as HTMLElement | undefined;
        if (!ruleRow) {
            throw new Error('Worksheet rule row was not rendered');
        }

        await act(async () => {
            ruleRow.click();
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Range');
        expect(container.textContent).toContain('Style type');

        await act(async () => {
            clickButton(container!, 'Cancel');
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Show');
        expect(container.textContent).toContain('A1');
        expect(currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)).toEqual([
            expect.objectContaining({
                cfId: 'cf-active',
                rule: expect.objectContaining({
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    value: 10,
                }),
            }),
        ]);
    });

    it('cancels rule editing on worksheet activation without saving in-progress changes', async () => {
        currentTestBed = createPanelTestBed();
        const originalRule = createNumberHighlightRule('cf-active', 10);
        await currentTestBed.commandService.executeCommand(AddCfCommand.id, {
            unitId: currentTestBed.unitId,
            subUnitId: currentTestBed.subUnitId,
            rule: originalRule,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let cancelRequests = 0;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleEdit
                        rule={originalRule}
                        onCancel={() => {
                            cancelRequests += 1;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const numberInput = Array.from(container.querySelectorAll('input'))
            .find((input) => input.value === '10') as HTMLInputElement | undefined;
        if (!numberInput) {
            throw new Error('Number condition input was not rendered');
        }

        await act(async () => {
            writeInput(numberInput, '99');
            await Promise.resolve();
        });

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(SetWorksheetActiveOperation.id, {
                unitId: currentTestBed!.unitId,
                subUnitId: currentTestBed!.subUnitId,
            });
            await Promise.resolve();
        });

        expect(cancelRequests).toBe(1);
        expect(currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)).toEqual([
            expect.objectContaining({
                cfId: 'cf-active',
                rule: expect.objectContaining({
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    value: 10,
                }),
            }),
        ]);
    });
});
