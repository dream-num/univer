import { ICellEditorManagerService } from '@univerjs/ui-plugin-sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import type { IHelpFunctionOperationParams } from '../../../services/prompt.service';
import { IFormulaPromptService } from '../../../services/prompt.service';
import styles from './index.module.less';

export function ErrorFunction() {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ left: 0, top: 0 });
    const promptService = useDependency(IFormulaPromptService);
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    useEffect(() => {
        // TODO@Dushusir: use cell notification service
        const subscription = promptService.help$.subscribe((params: IHelpFunctionOperationParams) => {
            const selection = cellEditorManagerService.getState();
            if (!selection) return;

            const { visible } = params;
            if (!visible) {
                setVisible(visible);
                return;
            }

            const { endX = 0, startY = 0 } = selection;
            setPosition({ left: endX, top: startY });
            setVisible(visible);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);
    return visible ? (
        <div className={styles.formulaErrorFunction} style={{ left: position.left, top: position.top }}>
            {/* TODO@Dushusir replace with CellError Component */}
            {/* CellError */}
        </div>
    ) : null;
}
