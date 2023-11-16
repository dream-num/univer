import { FunctionType, IFunctionInfo } from '@univerjs/base-formula-engine';
import { LocaleService } from '@univerjs/core';
import { Input, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useState } from 'react';

import { IDescriptionService } from '../../../services/description.service';
import { getFunctionTypeValues } from '../../../services/utils';
import styles from './index.module.less';

export function getSearchList(searchText: string, descriptionService: IDescriptionService) {
    const searchList: string[] = [];
    const functionList = descriptionService.getDescriptions();
    functionList.forEach((item) => {
        const { functionName } = item;
        if (functionName.indexOf(searchText.toLocaleUpperCase()) > -1) {
            searchList.push(functionName);
        }
    });

    return searchList;
}

function getFunctionInfo(functionName: string, descriptionService: IDescriptionService) {
    const functionList = descriptionService.getDescriptions();
    return functionList.get(functionName) || null;
}

export function SelectFunction() {
    const [selectList, setSelectList] = useState<string[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [active, setActive] = useState(0);
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);
    const descriptionService = useDependency(IDescriptionService);
    const localeService = useDependency(LocaleService);
    const options = getFunctionTypeValues(FunctionType, localeService);

    const highlightSearchText = (text: string) => {
        const regex = new RegExp(`(${searchText.toLocaleUpperCase()})`);
        const parts = text.split(regex).filter(Boolean);
        console.info('parts', parts, searchText);

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

    function handleSelectChange(value: string) {
        console.info('value=====', value);
    }

    function handleSearchInputChange(value: string) {
        setSearchText(value);
        const selectList = getSearchList(value, descriptionService);
        // console.info('搜索===', selectList, searchText);
        setSelectList(selectList);
        setActive(0);
        const functionInfo = getFunctionInfo(selectList[active], descriptionService);
        if (!functionInfo) return;
        setFunctionInfo(functionInfo);
    }

    function handleClickSelectItem(value: string) {
        console.info('value=====', value);
    }

    const handleLiMouseEnter = (index: number) => {
        setActive(index);
    };

    const handleLiMouseLeave = () => {
        setActive(-1);
    };
    return (
        <div>
            <div>
                <Select value="select" options={options} onChange={handleSelectChange}></Select>

                <Input
                    placeholder={localeService.t(`formula.formulaMore.searchFunctionPlaceholder`)}
                    onKeyDown={(e) => e.stopPropagation()}
                    value={searchText}
                    onChange={handleSearchInputChange}
                ></Input>
            </div>

            <ul className={styles.formulaSelectFunctionResult}>
                {selectList.map((item, index) => (
                    <li
                        key={index}
                        className={
                            active === index
                                ? `${styles.formulaSelectFunctionResultItem} ${styles.formulaSelectFunctionResultItemActive}`
                                : styles.formulaSelectFunctionResultItem
                        }
                        // onMouseEnter={() => handleLiMouseEnter(index)}
                        // onMouseLeave={handleLiMouseLeave}
                        onClick={() => handleClickSelectItem(item)}
                    >
                        <span className={styles.formulaSelectFunctionResultItemName}>{highlightSearchText(item)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
