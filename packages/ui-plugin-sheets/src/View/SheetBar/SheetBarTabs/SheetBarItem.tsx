import { Dropdown2, Icon, Menu2 } from '@univerjs/base-ui';
import { BooleanNumber, ICommandService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { SheetMenuPosition } from '../../../controller/menu/menu';
import styles from './index.module.less';
import { InputEdit } from './InputEdit';

export interface IBaseSheetBarProps {
    label?: string;
    children?: any[];
    index?: string;
    color?: string;
    sheetId?: string;
    style?: React.CSSProperties;
    hidden?: BooleanNumber;
    addSheet?: () => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    selectSheet?: (slideItemIndex: number) => void;
    changeSheetName?: (sheetId: string, name: string) => void;
    dragEnd?: (elements: HTMLElement[]) => void;
    selected?: boolean;
}

export function SheetBarItem(props: IBaseSheetBarProps) {
    const { onMouseDown, sheetId, label, color, selected } = props;

    const [visible, setVisible] = useState(false);
    const [currentSelected, setCurrentSelected] = useState(selected);

    const commandService = useDependency(ICommandService);

    useEffect(() => {
        // TODO: update too many times?
        setCurrentSelected(selected);
    }, [selected]);

    return (
        <Dropdown2
            visible={visible}
            trigger={['contextMenu']}
            overlay={
                <Menu2
                    menuType={SheetMenuPosition.SHEET_BAR}
                    onOptionSelect={(params) => {
                        const { label: commandId, value } = params;
                        commandService.executeCommand(commandId as string, { value, worksheetId: sheetId });
                        setVisible(false);
                    }}
                />
            }
            onVisibleChange={setVisible}
        >
            <div
                onClick={onMouseDown}
                onContextMenu={onMouseDown}
                key={sheetId}
                data-id={sheetId}
                className={
                    currentSelected ? `${styles.tabsTabActive} ${styles.slideTabItem}` : `${styles.slideTabItem}`
                }
            >
                <div className={`${styles.slideTabContent}`}>
                    <div className={`${styles.slideTabDivider}`}></div>
                    <div className={`${styles.slideTabTitle}`}>
                        <span className={`${styles.slideTabSpan}`}>
                            <InputEdit sheetId={sheetId} sheetName={label ?? ''} />
                        </span>
                    </div>
                    <div
                        className={`${styles.slideTabIcon}`}
                        data-slide-skip="true"
                        style={{ lineHeight: 1 }}
                        data-id={sheetId}
                        onClick={(e) => {
                            if (currentSelected) {
                                setVisible(true);
                            }
                        }}
                    >
                        <Icon.NextIcon />
                    </div>
                </div>
                <div className={`${styles.slideTabFooter}`}>
                    <div className={`${styles.slideTabActiveBar}`} style={color ? { background: color } : {}}></div>
                </div>
            </div>
        </Dropdown2>
    );
}
