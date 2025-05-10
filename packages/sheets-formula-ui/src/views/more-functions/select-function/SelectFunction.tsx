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
import type { ISearchItem } from '@univerjs/sheets-formula';
import type { ISidebarMethodOptions } from '@univerjs/ui';
import { LocaleService } from '@univerjs/core';
import { borderClassName, clsx, Input, Select } from '@univerjs/design';
import { FunctionType } from '@univerjs/engine-formula';
import { CheckMarkSingle } from '@univerjs/icons';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { ISidebarService, useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { getFunctionTypeValues } from '../../../services/utils';
import { FunctionHelp } from '../function-help/FunctionHelp';
import { FunctionParams } from '../function-params/FunctionParams';

export interface ISelectFunctionProps {
    onChange: (functionInfo: IFunctionInfo) => void;
}

export function SelectFunction(props: ISelectFunctionProps) {
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

    const options = getFunctionTypeValues(FunctionType, localeService);
    options.unshift({
        label: localeService.t('formula.moreFunctions.allFunctions'),
        value: allTypeValue,
    });

    const required = localeService.t('formula.prompt.required');
    const optional = localeService.t('formula.prompt.optional');

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
            return;
        }

        setNameSelected(selectedIndex);
        const functionInfo = descriptionService.getFunctionInfo(selectList[selectedIndex].name);
        if (!functionInfo) {
            setFunctionInfo(null);
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

    function handleSelectListKeyDown(e: React.KeyboardEvent<HTMLUListElement> | React.KeyboardEvent<HTMLInputElement>) {
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
            <div className="univer-flex univer-items-center univer-justify-between univer-gap-[10%]">
                <Select value={typeSelected} options={options} onChange={handleSelectChange} />

                <Input
                    placeholder={localeService.t('formula.moreFunctions.searchFunctionPlaceholder')}
                    onKeyDown={handleSelectListKeyDown}
                    value={searchText}
                    onChange={handleSearchInputChange}
                    size="small"
                    allowClear
                />
            </div>

            <ul
                className={clsx(`
                  univer-mx-0 univer-mb-0 univer-mt-2 univer-box-border univer-max-h-[364px] univer-w-full
                  univer-select-none univer-list-none univer-overflow-y-auto univer-rounded univer-p-3
                  univer-outline-none
                `, borderClassName)}
                onKeyDown={handleSelectListKeyDown}
                tabIndex={-1}
            >
                {selectList.map(({ name }, index) => (
                    <li
                        key={index}
                        className={clsx(`
                          univer-relative univer-box-border univer-cursor-pointer univer-rounded univer-px-7 univer-py-1
                          univer-text-sm univer-text-gray-900 univer-transition-colors
                          dark:univer-text-white
                        `, {
                            'univer-bg-gray-200': active === index,
                        })}
                        onMouseEnter={() => handleLiMouseEnter(index)}
                        onMouseLeave={handleLiMouseLeave}
                        onClick={() => setCurrentFunctionInfo(index)}
                    >
                        {nameSelected === index && (
                            <CheckMarkSingle
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

            {functionInfo && (
                <div className="univer-mx-0 univer-my-2 univer-max-h-[307px] univer-overflow-y-auto">
                    <FunctionParams title={functionInfo.functionName} value={functionInfo.description} />

                    <FunctionParams
                        title={localeService.t('formula.moreFunctions.syntax')}
                        value={<FunctionHelp prefix={functionInfo.functionName} value={functionInfo.functionParameter} />}
                    />

                    <FunctionParams
                        title={localeService.t('formula.prompt.helpExample')}
                        value={`${functionInfo.functionName}(${functionInfo.functionParameter
                            .map((item) => item.example)
                            .join(',')})`}
                    />

                    {functionInfo.functionParameter &&
                        functionInfo.functionParameter.map((item: IFunctionParam) => (
                            <FunctionParams
                                key={item.name}
                                title={item.name}
                                value={`${item.require ? required : optional} ${item.detail}`}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
