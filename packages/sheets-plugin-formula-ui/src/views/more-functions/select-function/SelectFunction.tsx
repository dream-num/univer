import { FunctionType, IFunctionInfo } from '@univerjs/base-formula-engine';
import { LocaleService } from '@univerjs/core';
import { Input, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useState } from 'react';

import { getFunctionName } from '../../../controllers/util';
import { FUNCTION_LIST } from '../../../services/function-list';
import { getFunctionTypeValues } from '../../../services/utils';
import styles from './index.module.less';

export function getSearchList(searchText: string, localeService: LocaleService) {
    const searchList: string[] = [];
    FUNCTION_LIST.forEach((item) => {
        const functionName = getFunctionName(item, localeService);
        if (functionName.indexOf(searchText.toLocaleUpperCase()) > -1) {
            searchList.push(functionName);
        }
    });

    return searchList;
}

function getFunctionInfo(functionName: string, localeService: LocaleService) {
    return FUNCTION_LIST.find((item) => getFunctionName(item, localeService) === functionName);
}

export function SelectFunction() {
    const [selectList, setSelectList] = useState<string[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [active, setActive] = useState(0);
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);
    const localeService = useDependency(LocaleService);
    const options = getFunctionTypeValues(FunctionType, localeService);

    const highlightSearchText = (text: string) => {
        const regex = new RegExp(`(${searchText})`);
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
        const selectList = getSearchList(value, localeService);
        // console.info('搜索===', selectList, searchText);
        setSelectList(selectList);
        setActive(0);
        const functionInfo = getFunctionInfo(selectList[active], localeService);
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
