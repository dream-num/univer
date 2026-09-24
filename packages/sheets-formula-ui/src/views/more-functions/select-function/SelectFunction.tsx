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

import type { IFunctionInfo, IFunctionParam } from '@univerjs/engine-formula';
import type { IUniverSheetsFormulaBaseConfig } from '@univerjs/sheets-formula';
import type { KeyboardEvent } from 'react';
import type { LocaleKey } from '../../../locale/types';
import { IConfigService, LocaleService, regexp } from '@univerjs/core';
import { borderClassName, clsx, divideYClassName, Input, scrollbarClassName, Select } from '@univerjs/design';
import { IDescriptionService } from '@univerjs/engine-formula';
import { CheckMarkIcon } from '@univerjs/icons';
import { PLUGIN_CONFIG_KEY_BASE } from '@univerjs/sheets-formula';
import { ISidebarService, useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { getFunctionName, getFunctionTypeValues } from '../../../services/utils';
import { FunctionHelp } from '../function-help/FunctionHelp';

export interface ISelectFunctionProps {
    onChange: (functionInfo: IFunctionInfo | null) => void;
    SelectComponent?: typeof Select;
}

export function SelectFunction(props: ISelectFunctionProps) {
    const configService = useDependency(IConfigService);
    const customFunction = configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE)?.function;

    const { onChange, SelectComponent = Select } = props;

    const allTypeValue = '-1';
    const [searchText, setSearchText] = useState<string>('');
    const [active, setActive] = useState(0);
    const [typeSelected, setTypeSelected] = useState(allTypeValue);
    const [nameSelected, setNameSelected] = useState(0);
    const descriptionService = useDependency(IDescriptionService);
    const localeService = useDependency(LocaleService);
    const sidebarService = useDependency(ISidebarService);
    const selectList = useMemo(() => {
        const query = searchText.trim().toUpperCase();
        return descriptionService.getSearchListByType(Number(typeSelected))
            .filter(({ name }) => name.toUpperCase().includes(query));
    }, [descriptionService, searchText, typeSelected]);
    const selectedItem = selectList[nameSelected];
    const functionInfo = selectedItem ? descriptionService.getFunctionInfo(selectedItem.name) ?? null : null;

    const options = getFunctionTypeValues(localeService, Boolean(customFunction))
        .filter(
            (option) => descriptionService.getSearchListByType(Number(option.value)).length > 0
        );

    options.unshift({
        label: localeService.t<LocaleKey>('sheets-formula-ui.moreFunctions.allFunctions'),
        value: allTypeValue,
    });

    const required = localeService.t<LocaleKey>('sheets-formula-ui.prompt.required');
    const optional = localeService.t<LocaleKey>('sheets-formula-ui.prompt.optional');

    useEffect(() => {
        onChange(functionInfo);
    }, [functionInfo, onChange]);

    useEffect(() => {
        const subscription = sidebarService.sidebarOptions$.subscribe((options) => {
            if (options.visible) {
                setSearchText('');
                setTypeSelected(allTypeValue);
                setActive(0);
                setNameSelected(0);
            }
        });
        return () => subscription.unsubscribe();
    }, [sidebarService]);

    const highlightSearchText = (text: string) => {
        const query = searchText.trim().toUpperCase();
        if (query === '') {
            return text;
        }

        const regex = new RegExp(`(${regexp.escapeRegExp(query)})`, 'i');
        const parts = text.split(regex).filter(Boolean);

        return parts.map((part: string, index: number) => {
            if (part.match(regex)) {
                return (
                    <span key={index} className="univer-text-red-500">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    function setCurrentFunctionInfo(selectedIndex: number) {
        if (selectList[selectedIndex]) {
            setNameSelected(selectedIndex);
        }
    }

    function handleSelectChange(value: string) {
        setTypeSelected(value);
        setActive(0);
        setNameSelected(0);
    }

    function handleSearchInputChange(value: string) {
        setSearchText(value);
        setActive(0);
        setNameSelected(0);
    }

    function handleSelectListKeyDown(e: KeyboardEvent<HTMLUListElement> | KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();
        if (selectList.length === 0) {
            return;
        }

        if (e.key === 'ArrowDown') {
            const nextActive = active + 1;
            setActive(nextActive === selectList.length ? 0 : nextActive);
        } else if (e.key === 'ArrowUp') {
            const nextActive = active - 1;
            setActive(nextActive === -1 ? selectList.length - 1 : nextActive);
        } else if (e.key === 'Enter') {
            setCurrentFunctionInfo(active);
        }
    }

    const handleLiMouseEnter = (index: number) => {
        setActive(index);
    };

    const handleLiMouseLeave = () => {
        setActive(-1);
    };

    return (
        <div>
            <div className="univer-flex univer-items-center univer-justify-between univer-gap-2">
                <SelectComponent value={typeSelected} options={options} onChange={handleSelectChange} />

                <Input
                    placeholder={localeService.t<LocaleKey>('sheets-formula-ui.moreFunctions.searchFunctionPlaceholder')}
                    onKeyDown={handleSelectListKeyDown}
                    value={searchText}
                    onChange={handleSearchInputChange}
                    size="small"
                    allowClear
                />
            </div>

            {selectList.length > 0 && (
                <ul
                    className={clsx(`
                      univer-mb-0 univer-mt-2 univer-box-border univer-max-h-72 univer-w-full univer-select-none
                      univer-list-none univer-overflow-y-auto univer-rounded univer-p-3 univer-outline-none
                    `, borderClassName, scrollbarClassName)}
                    onKeyDown={handleSelectListKeyDown}
                    tabIndex={-1}
                >
                    {selectList.map(({ name }, index) => (
                        <li
                            key={name}
                            className={clsx(`
                              univer-relative univer-box-border univer-cursor-pointer univer-rounded univer-px-7
                              univer-py-1 univer-text-sm univer-text-gray-900 univer-transition-colors
                              dark:!univer-text-gray-0
                            `, {
                                'univer-bg-gray-200 dark:!univer-bg-gray-600': active === index,
                            })}
                            onMouseEnter={() => handleLiMouseEnter(index)}
                            onMouseLeave={handleLiMouseLeave}
                            onClick={() => setCurrentFunctionInfo(index)}
                        >
                            {nameSelected === index && (
                                <CheckMarkIcon
                                    className={`
                                      univer-absolute univer-left-1.5 univer-top-1/2 univer-inline-flex
                                      -univer-translate-y-1/2 univer-text-base univer-text-primary-600
                                    `}
                                />
                            )}
                            <span className="univer-block">{highlightSearchText(name)}</span>
                        </li>
                    ))}
                </ul>
            )}

            {functionInfo && (
                <div
                    data-u-comp="formula-function-details"
                    className={clsx('univer-mx-0 univer-my-3 univer-overflow-y-auto', scrollbarClassName)}
                >
                    <div
                        className="
                          univer-rounded-lg univer-bg-gray-50 univer-p-3
                          dark:!univer-bg-gray-800
                        "
                    >
                        <div
                            className="
                              univer-text-sm univer-font-semibold univer-text-gray-900
                              dark:!univer-text-gray-0
                            "
                        >
                            {functionInfo && getFunctionName(functionInfo, localeService)}
                        </div>
                        <div
                            className="
                              univer-mt-1 univer-text-xs univer-leading-5 univer-text-gray-600
                              dark:!univer-text-gray-300
                            "
                        >
                            {functionInfo.description}
                        </div>
                    </div>

                    <div className="univer-mt-4 univer-flex univer-flex-col univer-gap-3">
                        <div>
                            <div
                                className="
                                  univer-text-xs univer-font-medium univer-text-gray-500
                                  dark:!univer-text-gray-300
                                "
                            >
                                {localeService.t<LocaleKey>('sheets-formula-ui.moreFunctions.syntax')}
                            </div>
                            <div
                                data-u-comp="formula-function-syntax"
                                className={clsx(`
                                  univer-mt-1.5 univer-break-words univer-rounded-md univer-bg-gray-50 univer-px-3
                                  univer-py-2 univer-font-mono univer-text-xs univer-leading-5 univer-text-gray-900
                                  dark:!univer-bg-gray-800 dark:!univer-text-gray-0
                                `, borderClassName)}
                            >
                                <FunctionHelp
                                    prefix={(functionInfo as any).label || functionInfo.functionName}
                                    value={functionInfo.functionParameter}
                                />
                            </div>
                        </div>

                        <div>
                            <div
                                className="
                                  univer-text-xs univer-font-medium univer-text-gray-500
                                  dark:!univer-text-gray-300
                                "
                            >
                                {localeService.t<LocaleKey>('sheets-formula-ui.prompt.helpExample')}
                            </div>
                            <div
                                data-u-comp="formula-function-example"
                                className={clsx(`
                                  univer-mt-1.5 univer-break-words univer-rounded-md univer-bg-gray-50 univer-px-3
                                  univer-py-2 univer-font-mono univer-text-xs univer-leading-5 univer-text-gray-900
                                  dark:!univer-bg-gray-800 dark:!univer-text-gray-0
                                `, borderClassName)}
                            >
                                {`${(functionInfo as any).label || functionInfo.functionName}(${functionInfo.functionParameter
                                    .map((item) => item.example)
                                    .join(',')})`}
                            </div>
                        </div>
                    </div>

                    {functionInfo.functionParameter.length > 0 && (
                        <div
                            className={clsx('univer-mt-4 univer-rounded-lg univer-px-3', borderClassName, divideYClassName)}
                        >
                            {functionInfo.functionParameter.map((item: IFunctionParam) => (
                                <div
                                    key={item.name}
                                    data-u-comp="formula-function-parameter"
                                    className="univer-py-3"
                                >
                                    <div className="univer-flex univer-items-center univer-gap-2">
                                        <span
                                            className={`
                                              univer-text-xs univer-font-medium univer-text-gray-900
                                              dark:!univer-text-gray-0
                                            `}
                                        >
                                            {item.name}
                                        </span>
                                        <span
                                            className={clsx(`
                                              univer-rounded-full univer-px-2 univer-py-0.5 univer-text-xs
                                              univer-leading-4
                                            `, item.require
                                                ? `
                                                  univer-bg-primary-50 univer-text-primary-600
                                                  dark:!univer-bg-primary-900 dark:!univer-text-primary-200
                                                `
                                                : `
                                                  univer-bg-gray-100 univer-text-gray-600
                                                  dark:!univer-bg-gray-700 dark:!univer-text-gray-200
                                                `)}
                                        >
                                            {item.require ? required : optional}
                                        </span>
                                    </div>
                                    <div
                                        className={`
                                          univer-mt-1 univer-text-xs univer-leading-5 univer-text-gray-600
                                          dark:!univer-text-gray-300
                                        `}
                                    >
                                        {item.detail}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
