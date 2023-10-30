import { Dropdown2, Menu2 } from '@univerjs/base-ui';
import { BooleanNumber, ICommandService } from '@univerjs/core';
import { SelectionBoxDropdown16 } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { RenameSheetOperation } from '../../../commands/commands/rename.command';
import { SheetMenuPosition } from '../../../controller/menu/menu';
import styles from './index.module.less';
import { InputEdit } from './InputEdit';

export interface IBaseSheetBarProps {
    label?: string;
    children?: any[];
    index?: number;
    color?: string;
    sheetId?: string;
    style?: React.CSSProperties;
    hidden?: BooleanNumber;
    addSheet?: () => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    changeSheetName?: (sheetId: string, name: string) => void;
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

    // FIXME The first sheet tab will be closed automatically
    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    const onDoubleClick = (worksheetId: string) => {
        commandService.executeCommand(RenameSheetOperation.id, { worksheetId });
    };

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
            onVisibleChange={onVisibleChange}
        >
            <div
                onContextMenu={onMouseDown}
                onDoubleClick={() => sheetId && onDoubleClick(sheetId)}
                key={sheetId}
                data-id={sheetId}
                className={
                    currentSelected ? `${styles.slideTabActive} ${styles.slideTabItem}` : `${styles.slideTabItem}`
                }
            >
                <div className={`${styles.slideTabContent}`}>
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
                        onMouseDown={(e) => {
                            console.info('mousedown icon', currentSelected);
                            if (currentSelected) {
                                setVisible(true);
                            }
                        }}
                    >
                        <SelectionBoxDropdown16 />
                    </div>
                </div>
                <div className={`${styles.slideTabFooter}`}>
                    <div className={`${styles.slideTabActiveBar}`} style={color ? { background: color } : {}}></div>
                </div>
            </div>
        </Dropdown2>
    );
}
