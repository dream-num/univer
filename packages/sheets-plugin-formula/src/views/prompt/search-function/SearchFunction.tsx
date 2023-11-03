import { Direction } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { ICellEditorManagerService } from '@univerjs/ui-plugin-sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { FUNCTION_LIST } from '../../../services/function-list';
import {
    IFormulaPromptService,
    INavigateParam,
    ISearchFunctionParams,
    ISearchItem,
} from '../../../services/prompt.service';
import styles from './index.module.less';

export function SearchFunction() {
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState(0);
    const [offset, setOffset] = useState<number[]>([0, 0]);
    const [searchList, setSearchList] = useState<ISearchItem[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);

    useEffect(() => {
        subscribeSearchText();
        // TODO@Dushusir: How to get updated values in subscribe callback better
        let updatedSearchList: ISearchItem[] = [];
        let updatedActive = 0;
        const subscribeSearch = promptService.search$.subscribe((params: ISearchFunctionParams) => {
            const selection = cellEditorManagerService.getState();
            if (!selection) return;

            const { show, searchText } = params;
            const { startX = 0, endY = 0 } = selection;

            const result: ISearchItem[] = [];
            FUNCTION_LIST.forEach((item) => {
                if (item.n.indexOf(searchText) > -1) {
                    result.push({ name: item.n, desc: item.a });
                }
            });

            setSearchList(result);
            updatedSearchList = result;
            setOffset([startX, endY]);
            setVisible(show);
            setActive(0); // Reset active state
        });

        const subscribeNavigate = promptService.navigate$.subscribe((params: INavigateParam) => {
            const { direction } = params;
            if (direction === Direction.UP) {
                let nextActive = updatedActive - 1;
                nextActive = nextActive < 0 ? updatedSearchList.length - 1 : nextActive;
                setActive(nextActive);
                updatedActive = nextActive;
            } else if (direction === Direction.DOWN) {
                let nextActive = updatedActive + 1;
                nextActive = nextActive >= updatedSearchList.length ? 0 : nextActive;
                setActive(nextActive);
                updatedActive = nextActive;
            }
        });

        const subscribeAccept = promptService.accept$.subscribe((params: boolean) => {
            const functionName = updatedSearchList[updatedActive].name;
            promptService.setAcceptFormulaName(functionName);
        });

        return () => {
            subscribeSearch?.unsubscribe();
            subscribeNavigate?.unsubscribe();
            subscribeAccept?.unsubscribe();
        };
    }, []);

    const subscribeSearchText = () => {
        promptService.search$.subscribe((params: ISearchFunctionParams) => {
            const { show, searchText } = params;
            setSearchText(searchText);
        });
    };

    const handleLiMouseEnter = (index: number) => {
        setActive(index);
    };

    const handleLiMouseLeave = () => {
        setActive(-1);
    };

    return (
        <Dropdown
            visible={visible}
            align={{ offset }}
            overlay={
                <ul className={styles.formulaSearchFunction}>
                    {searchList.map((item, index) => (
                        <li
                            key={index}
                            className={
                                active === index
                                    ? `${styles.formulaSearchFunctionItem} ${styles.formulaSearchFunctionItemActive}`
                                    : styles.formulaSearchFunctionItem
                            }
                            onMouseEnter={() => handleLiMouseEnter(index)}
                            onMouseLeave={handleLiMouseLeave}
                            onClick={() => promptService.setAcceptFormulaName(item.name)}
                        >
                            <span className={styles.formulaSearchFunctionItemName}>
                                <span className={styles.formulaSearchFunctionItemNameLight}>{searchText}</span>
                                <span>{item.name.slice(searchText.length)}</span>
                            </span>
                            <span className={styles.formulaSearchFunctionItemDesc}>{item.desc}</span>
                        </li>
                    ))}
                </ul>
            }
        >
            <span></span>
        </Dropdown>
    );
}
