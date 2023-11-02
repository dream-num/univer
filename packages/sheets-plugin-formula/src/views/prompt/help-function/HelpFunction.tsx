import { Dropdown } from '@univerjs/design';
import { ICellEditorManagerService } from '@univerjs/ui-plugin-sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { IFormulaPromptService } from '../../../services/prompt.service';
import styles from './index.module.less';

export function HelpFunction() {
    const [visible, setVisible] = useState(false);
    const [offset, setOffset] = useState<number[]>([0, 0]);
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);

    useEffect(() => {
        const subscription = promptService.help$.subscribe((show: boolean) => {
            const selection = cellEditorManagerService.getState();
            if (!selection) return;
            const { startX = 0, endY = 0 } = selection;
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
            overlay={<div className={styles.formulaHelpFunction}>I am Help Function</div>}
        >
            <span></span>
        </Dropdown>
    );
}
