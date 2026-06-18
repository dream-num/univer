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
import { BooleanNumber, LocaleService, LocaleType } from '@univerjs/core';
import { AddCfCommand, CFNumberOperator, CFRuleType, CFSubRuleType, DeleteCfCommand } from '@univerjs/sheets-conditional-formatting';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../../__tests__/create-cf-ui-test-bed';
import { ConditionalFormattingI18nController } from '../../../controllers/cf.i18n.controller';
import { RuleList } from '../RuleList';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ACTIVE_RANGE: IRange = {
    startRow: 0,
    endRow: 0,
    startColumn: 0,
    endColumn: 0,
};

const FAR_RANGE: IRange = {
    startRow: 5,
    endRow: 5,
    startColumn: 5,
    endColumn: 5,
};

class TestMarkSelectionService {
    addShape() {
        return 'shape-id';
    }

    removeShape() {
        // no canvas layer is created for these view tests.
    }
}

function createNumberHighlightRule(cfId: string, range: IRange, value: number): IConditionFormattingRule {
    return {
        cfId,
        ranges: [range],
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

async function createRuleListTestBed() {
    const testBed = createCfUiTestBed();

    testBed.injector.add([ConditionalFormattingI18nController]);
    testBed.injector.add([IMarkSelectionService, { useClass: TestMarkSelectionService as never }]);
    testBed.commandService.registerCommand(AddCfCommand);
    testBed.commandService.registerCommand(DeleteCfCommand);
    testBed.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            sheets: {
                conditional: {
                    formatting: {
                        ui: {
                            panel: {
                                managerRuleSelect: 'Show {0}',
                                workSheet: 'Worksheet',
                                selectedRange: 'Selected range',
                                createRule: 'Create rule',
                                clear: 'Clear rules',
                            },
                            preview: {
                                describe: {
                                    greaterThan: 'Greater than {0}',
                                },
                            },
                        },
                    },
                },
            },
            'sheets-conditional-formatting-ui': {
                panel: {
                    managerRuleSelect: 'Show {0}',
                    workSheet: 'Worksheet',
                    selectedRange: 'Selected range',
                    createRule: 'Create rule',
                    clear: 'Clear rules',
                },
                preview: {
                    describe: {
                        greaterThan: 'Greater than {0}',
                    },
                },
            },
        },
    });

    testBed.setSelection(ACTIVE_RANGE);
    await testBed.commandService.executeCommand(AddCfCommand.id, {
        unitId: testBed.unitId,
        subUnitId: testBed.subUnitId,
        rule: createNumberHighlightRule('cf-active', ACTIVE_RANGE, 10),
    });
    await testBed.commandService.executeCommand(AddCfCommand.id, {
        unitId: testBed.unitId,
        subUnitId: testBed.subUnitId,
        rule: createNumberHighlightRule('cf-far', FAR_RANGE, 20),
    });

    return testBed;
}

describe('RuleList', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: Awaited<ReturnType<typeof createRuleListTestBed>> | undefined;

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

    it('shows only conditional formatting rules intersecting the current sheet selection in selected-range mode', async () => {
        currentTestBed = await createRuleListTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleList onClick={() => undefined} onCreate={() => undefined} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(container.textContent).toContain('A1');
        expect(container.textContent).toContain('F6');

        await act(async () => {
            container!.querySelector('[data-u-comp="select"]')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        const selectedRangeOption = Array.from(document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]'))
            .find((button) => button.textContent === 'Selected range');

        expect(selectedRangeOption).toBeDefined();

        await act(async () => {
            selectedRangeOption!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(container.textContent).toContain('A1');
        expect(container.textContent).not.toContain('F6');
    });

    it('clears only the conditional formatting rules visible in selected-range mode', async () => {
        currentTestBed = await createRuleListTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleList onClick={() => undefined} onCreate={() => undefined} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await act(async () => {
            container!.querySelector('[data-u-comp="select"]')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            await Promise.resolve();
        });

        const selectedRangeOption = Array.from(document.querySelectorAll('[data-slot="dropdown-menu-radio-item"]'))
            .find((button) => button.textContent === 'Selected range');

        expect(selectedRangeOption).toBeDefined();

        await act(async () => {
            selectedRangeOption!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(container.textContent).toContain('A1');
        expect(container.textContent).not.toContain('F6');

        const clearRulesButton = container.querySelectorAll('a')[1];

        expect(clearRulesButton).toBeDefined();

        await act(async () => {
            clearRulesButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        const remainingRules = currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId);

        expect(remainingRules?.map((rule) => rule.cfId)).toEqual(['cf-far']);
        expect(container.textContent).not.toContain('A1');
    });

    it('deletes only the clicked conditional formatting rule', async () => {
        currentTestBed = await createRuleListTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleList onClick={() => undefined} onCreate={() => undefined} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const activeRangeText = Array.from(container.querySelectorAll('div'))
            .find((element) => element.textContent === 'A1');
        const activeRuleRow = activeRangeText?.parentElement?.parentElement as HTMLElement | undefined;
        const activeRuleDeleteButton = activeRuleRow?.lastElementChild as HTMLElement | undefined;

        if (!activeRuleDeleteButton) {
            throw new Error('Rule delete control was not rendered');
        }

        await act(async () => {
            activeRuleDeleteButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        const remainingRules = currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId);

        expect(remainingRules?.map((rule) => rule.cfId)).toEqual(['cf-far']);
        expect(container.textContent).not.toContain('A1');
        expect(container.textContent).toContain('F6');
    });

    it('clears all worksheet conditional formatting rules in worksheet mode', async () => {
        currentTestBed = await createRuleListTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleList onClick={() => undefined} onCreate={() => undefined} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(container.textContent).toContain('A1');
        expect(container.textContent).toContain('F6');

        const clearRulesButton = container.querySelectorAll('a')[1];

        expect(clearRulesButton).toBeDefined();

        await act(async () => {
            clearRulesButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(currentTestBed.ruleModel.getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)).toEqual([]);
        expect(container.textContent).not.toContain('A1');
        expect(container.textContent).not.toContain('F6');
    });
});
