import { Dropdown } from '@univerjs/design';
import { ICellEditorManagerService } from '@univerjs/ui-plugin-sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { IFormulaPromptService, ISearchFunctionParams } from '../../../services/prompt.service';
import styles from './index.module.less';

export function SearchFunction() {
    const [visible, setVisible] = useState(false);
    const [offset, setOffset] = useState<number[]>([0, 0]);
    const [searchList, setSearchList] = useState<string[]>([]);
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);

    useEffect(() => {
        const subscription = promptService.search$.subscribe((params: ISearchFunctionParams) => {
            const selection = cellEditorManagerService.getState();
            if (!selection) return;

            const { show, searchList } = params;
            const { startX = 0, endY = 0 } = selection;

            setSearchList(searchList);
            setOffset([startX, endY]);
            setVisible(show);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return (
        <Dropdown
            visible={visible}
            align={{ offset }}
            overlay={
                <ul className={styles.formulaSearchFunction}>
                    {searchList.map((item, index) => (
                        <li key={index} className={styles.formulaSearchFunctionItem}>
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
