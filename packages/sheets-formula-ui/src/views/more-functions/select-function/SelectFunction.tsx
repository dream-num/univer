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
import type { ISearchItem, IUniverSheetsFormulaBaseConfig } from '@univerjs/sheets-formula';
import type { ISidebarMethodOptions } from '@univerjs/ui';
import type { KeyboardEvent } from 'react';
import type { LocaleKey } from '../../../locale/types';
import { IConfigService, LocaleService } from '@univerjs/core';
import { borderClassName, clsx, divideYClassName, Input, scrollbarClassName, Select } from '@univerjs/design';
import { CheckMarkIcon } from '@univerjs/icons';
import { IDescriptionService, PLUGIN_CONFIG_KEY_BASE } from '@univerjs/sheets-formula';
import { ISidebarService, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { getFunctionTypeValues } from '../../../services/utils';
import { FunctionHelp } from '../function-help/FunctionHelp';

export interface ISelectFunctionProps {
    onChange: (functionInfo: IFunctionInfo | null) => void;
}

export function SelectFunction(props: ISelectFunctionProps) {
    const configService = useDependency(IConfigService);
    const customFunction = configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE)?.function;

    const { onChange } = props;

    const allTypeValue = '-1';
    const [searchText, setSearchText] = useState<string>('');
    const [selectList, setSelectList] = useState<ISearchItem[]>([]);
    const [active, setActive] = useState(0);
    const [typeSelected, setTypeSelected] = useState(allTypeValue);
    const [nameSelected, setNameSelected] = useState(0);
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);
    const descriptionService = useDependency(IDescriptionService);
    const localeService = useDependency(LocaleService);
    const sidebarService = useDependency(ISidebarService);
    const sidebarOptions = useObservable<ISidebarMethodOptions>(sidebarService.sidebarOptions$);

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
        handleSelectChange(allTypeValue);
    }, []);

    useEffect(() => {
        setCurrentFunctionInfo(0);
    }, [selectList]);

    // Reset data when the component enters again
    useEffect(() => {
        if (sidebarOptions?.visible) {
            setSearchText('');
            setSelectList([]);
            setActive(0);
            setTypeSelected(allTypeValue);
            setNameSelected(0);
            setFunctionInfo(null);
            handleSelectChange(allTypeValue);
        }
    }, [sidebarOptions]);

    const highlightSearchText = (text: string) => {
        if (searchText.trim() === '') return text;

        const regex = new RegExp(`(${searchText.toLocaleUpperCase()})`);
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

    const setCurrentFunctionInfo = (selectedIndex: number) => {
        if (selectList.length === 0) {
            setFunctionInfo(null);
            onChange(null);
            return;
        }

        setNameSelected(selectedIndex);
        const functionInfo = descriptionService.getFunctionInfo(selectList[selectedIndex].name);
        if (!functionInfo) {
            setFunctionInfo(null);
            onChange(null);
            return;
        }

        setFunctionInfo(functionInfo);
        onChange(functionInfo);
    };

    function handleSelectChange(value: string) {
        setTypeSelected(value);
        const selectList = descriptionService.getSearchListByType(+value);
        setSelectList(selectList);
    }

    // TODO@Dushusir: debounce
    function handleSearchInputChange(value: string) {
        setSearchText(value);
        const selectList = descriptionService.getSearchListByName(value);
        setSelectList(selectList);
    }

    function handleSelectListKeyDown(e: KeyboardEvent<HTMLUListElement> | KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();
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
                <Select value={typeSelected} options={options} onChange={handleSelectChange} />

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
                            key={index}
                            className={clsx(`
                              univer-relative univer-box-border univer-cursor-pointer univer-rounded univer-px-7
                              univer-py-1 univer-text-sm univer-text-gray-900 univer-transition-colors
                              dark:!univer-text-white
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
                              dark:!univer-text-white
                            "
                        >
                            {functionInfo.functionName}
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
                                  dark:!univer-bg-gray-800 dark:!univer-text-white
                                `, borderClassName)}
                            >
                                <FunctionHelp
                                    prefix={functionInfo.functionName}
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
                                  dark:!univer-bg-gray-800 dark:!univer-text-white
                                `, borderClassName)}
                            >
                                {`${functionInfo.functionName}(${functionInfo.functionParameter
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
                                              dark:!univer-text-white
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
