import { Direction } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { ICellEditorManagerService } from '@univerjs/ui-plugin-sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { IFormulaPromptService, INavigateParam, ISearchFunctionParams } from '../../../services/prompt.service';
import styles from './index.module.less';

export function SearchFunction() {
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState(0);
    const [offset, setOffset] = useState<number[]>([0, 0]);
    const [searchList, setSearchList] = useState<string[]>([]);
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);

    useEffect(() => {
        let updatedSearchList: string[] = [];
        let updatedActive = 0;
        const subscribeSearch = promptService.search$.subscribe((params: ISearchFunctionParams) => {
            const selection = cellEditorManagerService.getState();
            if (!selection) return;

            const { show, searchList } = params;
            const { startX = 0, endY = 0 } = selection;

            setSearchList(searchList);
            updatedSearchList = searchList;
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

        return () => {
            subscribeSearch?.unsubscribe();
            subscribeNavigate?.unsubscribe();
        };
    }, []);

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
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            }
        >
            <span></span>
        </Dropdown>
    );
}
