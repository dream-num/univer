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
import { BooleanNumber, LocaleService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import { SetSelectionsOperation } from '@univerjs/sheets';
import {
    AddCfCommand,
    CFNumberOperator,
    CFRuleType,
    CFSubRuleType,
    DeleteCfCommand,
    MoveCfCommand,
} from '@univerjs/sheets-conditional-formatting';
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
    readonly addedRanges: IRange[] = [];
    removeCount = 0;

    addShape(selection: { range: IRange }) {
        this.addedRanges.push(selection.range);
        return 'shape-id';
    }

    removeShape() {
        this.removeCount += 1;
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
    testBed.commandService.registerCommand(MoveCfCommand);
    testBed.commandService.registerCommand(SetSelectionsOperation);
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

    it('refreshes selected-range rules when the active sheet selection changes', async () => {
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

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: currentTestBed!.unitId,
                subUnitId: currentTestBed!.subUnitId,
                selections: [{
                    range: {
                        ...FAR_RANGE,
                        rangeType: RANGE_TYPE.NORMAL,
                    },
                    primary: null,
                    style: null,
                }],
            });
            await new Promise((resolve) => setTimeout(resolve, 32));
        });

        expect(container.textContent).not.toContain('A1');
        expect(container.textContent).toContain('F6');
    });

    it('deletes only the clicked conditional formatting rule', async () => {
        currentTestBed = await createRuleListTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const openedRuleIds: string[] = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleList onClick={(rule) => openedRuleIds.push(rule.cfId)} onCreate={() => undefined} />
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

        expect(openedRuleIds).toEqual([]);
        expect(remainingRules?.map((rule) => rule.cfId)).toEqual(['cf-far']);
        expect(container.textContent).not.toContain('A1');
        expect(container.textContent).toContain('F6');
    });

    it('opens the clicked conditional formatting rule for editing without changing worksheet rules', async () => {
        currentTestBed = await createRuleListTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const openedRuleIds: string[] = [];

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleList onClick={(rule) => openedRuleIds.push(rule.cfId)} onCreate={() => undefined} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const activeRangeText = Array.from(container.querySelectorAll('div'))
            .find((element) => element.textContent === 'A1');
        const activeRuleRow = activeRangeText?.parentElement?.parentElement as HTMLElement | undefined;
        const ruleIdsBeforeOpen = currentTestBed.ruleModel
            .getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)
            ?.map((rule) => rule.cfId);

        if (!activeRuleRow) {
            throw new Error('Rule row was not rendered');
        }

        await act(async () => {
            activeRuleRow.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(openedRuleIds).toEqual(['cf-active']);
        expect(
            currentTestBed.ruleModel
                .getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)
                ?.map((rule) => rule.cfId)
        ).toEqual(ruleIdsBeforeOpen);
    });

    it('highlights the hovered conditional formatting rule range and clears it on leave', async () => {
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
        const markSelectionService = currentTestBed.injector.get(IMarkSelectionService) as unknown as TestMarkSelectionService;

        if (!activeRuleRow) {
            throw new Error('Rule row was not rendered');
        }

        await act(async () => {
            activeRuleRow.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
            await Promise.resolve();
        });

        expect(markSelectionService.addedRanges).toEqual([ACTIVE_RANGE]);

        await act(async () => {
            activeRuleRow.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(markSelectionService.removeCount).toBe(1);
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

    it('starts the create-rule flow from the toolbar without changing existing worksheet rules', async () => {
        currentTestBed = await createRuleListTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let createRequests = 0;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RuleList
                        onClick={() => undefined}
                        onCreate={() => {
                            createRequests += 1;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const createRuleButton = container.querySelectorAll('a')[0];
        const ruleIdsBeforeCreate = currentTestBed.ruleModel
            .getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)
            ?.map((rule) => rule.cfId);

        await act(async () => {
            createRuleButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        expect(createRequests).toBe(1);
        expect(
            currentTestBed.ruleModel
                .getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)
                ?.map((rule) => rule.cfId)
        ).toEqual(ruleIdsBeforeCreate);
    });

    it('moves a dragged worksheet rule after the drop target rule', async () => {
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

        const ruleRows = Array.from(container.querySelectorAll<HTMLElement>('[data-draggable-list-item-id]'));
        const firstRuleRow = ruleRows[0];
        const secondRuleRow = ruleRows[1];
        const dragHandle = firstRuleRow?.querySelector<HTMLElement>('.draggableHandle');

        if (!firstRuleRow || !secondRuleRow || !dragHandle) {
            throw new Error('Rule drag controls were not rendered');
        }

        expect(
            currentTestBed.ruleModel
                .getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)
                ?.map((rule) => rule.cfId)
        ).toEqual(['cf-far', 'cf-active']);

        Object.defineProperty(firstRuleRow, 'setPointerCapture', {
            configurable: true,
            value() {},
        });

        const elementFromPoint = document.elementFromPoint;
        Object.defineProperty(document, 'elementFromPoint', {
            configurable: true,
            value: () => secondRuleRow,
        });

        try {
            await act(async () => {
                dragHandle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 1, clientY: 1, pointerId: 7 }));
                await Promise.resolve();
            });

            await act(async () => {
                window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 1, clientY: 80, pointerId: 7 }));
                await Promise.resolve();
            });

            await act(async () => {
                window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 1, clientY: 80, pointerId: 7 }));
                await Promise.resolve();
            });
        } finally {
            Object.defineProperty(document, 'elementFromPoint', {
                configurable: true,
                value: elementFromPoint,
            });
        }

        expect(
            currentTestBed.ruleModel
                .getSubunitRules(currentTestBed.unitId, currentTestBed.subUnitId)
                ?.map((rule) => rule.cfId)
        ).toEqual(['cf-active', 'cf-far']);
    });
});
