/**
 * Copyright 2023-present DreamNum Inc.
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
import { LocaleService, useDependency, useObservable } from '@univerjs/core';
import { Input, Select } from '@univerjs/design';
import { FunctionType } from '@univerjs/engine-formula';
import { CheckMarkSingle } from '@univerjs/icons';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { ISidebarService } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { getFunctionTypeValues } from '../../../services/utils';
import { FunctionHelp } from '../function-help/FunctionHelp';
import { FunctionParams } from '../function-params/FunctionParams';
import styles from './index.module.less';

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
                    <span key={index} className={styles.formulaSelectFunctionResultItemNameLight}>
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
            <div className={styles.formulaSelectFunctionSelect}>
                <Select value={typeSelected} options={options} onChange={handleSelectChange} />

                <Input
                    placeholder={localeService.t('formula.moreFunctions.searchFunctionPlaceholder')}
                    onKeyDown={handleSelectListKeyDown}
                    value={searchText}
                    onChange={handleSearchInputChange}
                    size="large"
                    allowClear
                />
            </div>

            <ul className={styles.formulaSelectFunctionResult} onKeyDown={handleSelectListKeyDown} tabIndex={-1}>
                {selectList.map(({ name }, index) => (
                    <li
                        key={index}
                        className={active === index
                            ? `
                              ${styles.formulaSelectFunctionResultItem}
                              ${styles.formulaSelectFunctionResultItemActive}
                            `
                            : styles.formulaSelectFunctionResultItem}
                        onMouseEnter={() => handleLiMouseEnter(index)}
                        onMouseLeave={handleLiMouseLeave}
                        onClick={() => setCurrentFunctionInfo(index)}
                    >
                        {nameSelected === index && (
                            <CheckMarkSingle className={styles.formulaSelectFunctionResultItemSelected} />
                        )}
                        <span className={styles.formulaSelectFunctionResultItemName}>{highlightSearchText(name)}</span>
                    </li>
                ))}
            </ul>

            {functionInfo && (
                <div className={styles.formulaSelectFunctionContent}>
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
                        functionInfo.functionParameter.map((item: IFunctionParam, i: number) => (
                            <FunctionParams
                                key={i}
                                title={item.name}
                                value={`${item.require ? required : optional} ${item.detail}`}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
