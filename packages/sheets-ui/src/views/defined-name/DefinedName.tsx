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

import type { Workbook, Worksheet } from '@univerjs/core';
import type { IDefinedNamesServiceParam } from '@univerjs/engine-formula';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { IScrollToCellCommandParams } from '../../commands/commands/set-scroll.command';
import { AbsoluteRefType, debounce, ICommandService, IUniverInstanceService, ThemeService, UniverInstanceType } from '@univerjs/core';
import { borderRightClassName, clsx, Dropdown } from '@univerjs/design';
import { deserializeRangeWithSheet, IDefinedNamesService, isReferenceString, LexerTreeBuilder, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { MoreDownIcon } from '@univerjs/icons';
import { getPrimaryForRange, SetSelectionsOperation, SetWorksheetShowCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { ScrollToCellCommand } from '../../commands/commands/set-scroll.command';
import { genNormalSelectionStyle } from '../../services/selection/const';
import { DefinedNameOverlay } from './DefinedNameOverlay';

export function DefinedName({ disable }: { disable: boolean }) {
    const [rangeString, setRangeString] = useState('');
    const [inputValue, setInputValue] = useState('');
    const definedNamesService = useDependency(IDefinedNamesService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SheetsSelectionsService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook?.getUnitId();
    const themeService = useDependency(ThemeService);

    const [open, setOpen] = useState(false);
    const [isInputEvent, setIsInputEvent] = useState(false);

    const getDefinedNameMap = () => {
        const definedNameMap = definedNamesService.getDefinedNameMap(unitId);
        if (definedNameMap) {
            return Array.from(Object.values(definedNameMap));
        }

        return [];
    };

    const focusDefinedName = async (definedName: IDefinedNamesServiceParam) => {
        // The worksheet may be hidden, so we need to show it first
        const { formulaOrRefString, id } = definedName;
        const worksheet = definedNamesService.getWorksheetByRef(unitId, formulaOrRefString);
        if (!worksheet) {
            return;
        }

        const isHidden = worksheet.isSheetHidden();
        if (isHidden) {
            await commandService.executeCommand(SetWorksheetShowCommand.id, { unitId, subUnitId: worksheet.getSheetId() });
        }

        definedNamesService.focusRange(unitId, id);
    };

    const focusSelection = (refString: string) => {
        const worksheet = workbook.getActiveSheet();
        const subUnitId = worksheet.getSheetId();

        getSelections(worksheet, refString).then((selections) => {
            if (!selections) return;

            commandService.executeCommand(SetSelectionsOperation.id, {
                unitId,
                subUnitId,
                selections,
            });

            commandService.executeCommand(
                ScrollToCellCommand.id,
                { range: selections[0].range } as IScrollToCellCommandParams
            );
        });
    };

    const [definedNames, setDefinedNames] = useState<IDefinedNamesServiceParam[]>(getDefinedNameMap());

    useEffect(() => {
        const definedNamesSubscription = definedNamesService.update$.subscribe(() => {
            setDefinedNames(getDefinedNameMap());
        });

        return () => {
            definedNamesSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const subscription = definedNamesService.currentRange$.subscribe(() => {
            const selections = selectionManagerService.getCurrentSelections();
            const worksheet = workbook.getActiveSheet();
            const formulaOrRefs = selections?.map((selection) => {
                return serializeRangeWithSheet(worksheet.getName(), selection.range);
            })?.join(',');
            const absoluteRef = lexerTreeBuilder.convertRefersToAbsolute(formulaOrRefs, AbsoluteRefType.ALL, AbsoluteRefType.ALL, worksheet.getName());
            const definedName = definedNamesService.getDefinedNameByRefString(unitId, absoluteRef);

            if (definedName) {
                setRangeString(definedName.name);
                setInputValue(definedName.name);
            } else {
                const range = definedNamesService.getCurrentRangeForString();
                setRangeString(range);
                setInputValue(range);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    const handleDefinedNamesList = debounce((value: string) => {
        const hasMatch = definedNames.find((i) => i.name.toLowerCase().includes(value.toLowerCase()));

        if (hasMatch && !open) {
            setOpen(true);
        } else if (!hasMatch && open) {
            setOpen(false);
        }
    }, 100);

    function handleChangeSelection(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value.trim();
        setInputValue(value);
        setIsInputEvent(true);

        if (!value) {
            if (open) setOpen(false);
            return;
        }

        handleDefinedNamesList(value);
    }

    // TODO: need implemented set defined name if value not referenceString
    function confirm() {
        if (inputValue === rangeString) return;

        const definedName = definedNames.find((i) => i.name === inputValue);
        if (definedName) {
            setRangeString(inputValue);
            focusDefinedName(definedName);
        } else if (isReferenceString(inputValue)) {
            setRangeString(inputValue);
            focusSelection(inputValue);
        } else {
            resetValue();
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (disable) return;

        if (e.key === 'Enter') {
            confirm();
            setIsInputEvent(false);
            setOpen(false);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsInputEvent(false);
            resetValue();
        }
    }

    function resetValue() {
        setInputValue(rangeString);
    }

    async function getSelections(worksheet: Worksheet, formulaOrRefString: string) {
        if (!worksheet) return;

        const unitRange = deserializeRangeWithSheet(formulaOrRefString.trim());

        const range = unitRange.range;
        const { startRow, startColumn, endRow, endColumn } = range;
        const primary = getPrimaryForRange({
            startRow,
            startColumn,
            endRow,
            endColumn,
        }, worksheet);

        const selections = [];
        selections.push({
            range: unitRange.range,
            style: genNormalSelectionStyle(themeService),
            primary,
        });

        return selections;
    }

    return (
        <div
            data-u-comp="defined-name"
            className={`
              univer-relative univer-box-border univer-flex univer-h-full univer-w-24 univer-border-r-gray-200
              univer-py-1.5 univer-transition-all
            `}
        >
            <input
                className={clsx(`
                  univer-box-border univer-h-full univer-w-full univer-appearance-none univer-pl-1.5 univer-pr-5
                  univer-text-gray-900
                  focus:univer-outline-none
                  dark:!univer-border-r-gray-700 dark:!univer-bg-gray-900 dark:!univer-text-white
                `, borderRightClassName, {
                    'univer-cursor-not-allowed': disable,
                })}
                type="text"
                value={inputValue}
                onChange={handleChangeSelection}
                onKeyDown={handleKeyDown}
                onBlur={() => setIsInputEvent(false)}
            />

            <Dropdown
                overlay={(
                    <div className="univer-z-[1001]">
                        <DefinedNameOverlay search={inputValue} isInputEvent={isInputEvent} />
                    </div>
                )}
                disabled={disable}
                open={open}
                onOpenChange={setOpen}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <a
                    className={clsx(`
                      univer-absolute univer-right-0 univer-top-0 univer-flex univer-h-full univer-cursor-pointer
                      univer-items-center univer-justify-center univer-px-1 univer-transition-colors univer-duration-200
                      hover:univer-bg-gray-100
                      dark:!univer-text-white dark:hover:!univer-bg-gray-800
                    `, {
                        'univer-cursor-not-allowed univer-text-gray-300 hover:univer-bg-transparent dark:!univer-text-gray-700': disable,
                    })}
                >
                    <MoreDownIcon />
                </a>
            </Dropdown>
        </div>
    );
}
