import { Direction, FOCUSING_FORMULA_EDITOR, IContextService } from '@univerjs/core';
import { Popup } from '@univerjs/design';
import { ICellEditorManagerService, IFormulaEditorManagerService } from '@univerjs/sheets-ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import type { ISearchItem } from '../../../services/description.service';
import type { INavigateParam, ISearchFunctionOperationParams } from '../../../services/prompt.service';
import { IFormulaPromptService } from '../../../services/prompt.service';
import styles from './index.module.less';

export function SearchFunction() {
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState(0);
    const [offset, setOffset] = useState<[number, number]>([0, 0]);
    const [searchList, setSearchList] = useState<ISearchItem[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);
    const contextService = useDependency(IContextService);

    useEffect(() => {
        // TODO@Dushusir: How to get updated values in subscribe callback better
        let updatedSearchList: ISearchItem[] = [];
        let updatedActive = 0;
        const subscribeSearch = promptService.search$.subscribe((params: ISearchFunctionOperationParams) => {
            const { visible, searchText, searchList } = params;
            if (!visible) {
                setVisible(visible);
                return;
            }

            const isFocusFormulaEditor = contextService.getContextValue(FOCUSING_FORMULA_EDITOR);

            const position = isFocusFormulaEditor
                ? formulaEditorManagerService.getPosition()
                : cellEditorManagerService.getRect();

            if (position == null) {
                return;
            }

            const { left, top, height } = position;

            setSearchText(searchText);
            setSearchList(searchList);
            updatedSearchList = searchList;
            setOffset([left, top + height]);
            setVisible(visible);
            setActive(0); // Reset active state
            updatedActive = 0;
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
            promptService.acceptFormulaName(functionName);
        });

        return () => {
            subscribeSearch?.unsubscribe();
            subscribeNavigate?.unsubscribe();
            subscribeAccept?.unsubscribe();
        };
    }, []);

    function handleLiMouseEnter(index: number) {
        setActive(index);
    }

    function handleLiMouseLeave() {
        setActive(-1);
    }

    return (
        <Popup visible={visible} offset={offset}>
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
                        onClick={() => promptService.acceptFormulaName(item.name)}
                    >
                        <span className={styles.formulaSearchFunctionItemName}>
                            <span className={styles.formulaSearchFunctionItemNameLight}>{searchText}</span>
                            <span>{item.name.slice(searchText.length)}</span>
                        </span>
                        <span className={styles.formulaSearchFunctionItemDesc}>{item.desc}</span>
                    </li>
                ))}
            </ul>
        </Popup>
    );
}
