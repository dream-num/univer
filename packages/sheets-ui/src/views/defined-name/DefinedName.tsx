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
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { IScrollToCellCommandParams } from '../../commands/commands/set-scroll.command';
import { ICommandService, IUniverInstanceService, ThemeService, UniverInstanceType } from '@univerjs/core';
import { borderRightClassName, clsx, Dropdown } from '@univerjs/design';
import { deserializeRangeWithSheet, IDefinedNamesService, isReferenceString } from '@univerjs/engine-formula';
import { MoreDownIcon } from '@univerjs/icons';
import { getPrimaryForRange, SetSelectionsOperation } from '@univerjs/sheets';
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
    const worksheet = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
    const unitId = worksheet?.getUnitId();
    const subUnitId = worksheet?.getSheetId();
    const themeService = useDependency(ThemeService);

    useEffect(() => {
        const subscription = definedNamesService.currentRange$.subscribe(() => {
            const range = definedNamesService.getCurrentRangeForString();
            setRangeString(range);
            setInputValue(range);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    function handleChangeSelection(e: ChangeEvent<HTMLInputElement>) {
        setInputValue(e.target.value.trim());
    }

    // TODO: need implemented set defined name if value not referenceString
    function confirm() {
        if (inputValue === rangeString) return;
        if (!isReferenceString(inputValue)) {
            resetValue();
            return;
        };

        setRangeString(inputValue);

        getSelections(worksheet, inputValue).then((selections) => {
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
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (disable) return;

        if (e.key === 'Enter') {
            confirm();
        } else if (e.key === 'Escape') {
            e.preventDefault();
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
                  univer-box-border univer-h-full univer-w-full univer-appearance-none univer-px-1.5
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
            />

            <Dropdown
                overlay={(
                    <div className="univer-z-[1001]">
                        <DefinedNameOverlay />
                    </div>
                )}
                disabled={disable}
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
