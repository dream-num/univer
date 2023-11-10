import { TinyColor } from '@ctrl/tinycolor';
import { Menu } from '@univerjs/base-ui';
import { BooleanNumber, ICommandService, ThemeService } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { SheetMenuPosition } from '../../../controllers/menu/menu';
import styles from './index.module.less';

export interface IBaseSheetBarProps {
    label?: string;
    children?: any[];
    index?: number;
    color?: string;
    sheetId?: string;
    style?: React.CSSProperties;
    hidden?: BooleanNumber;
    selected?: boolean;
}

export function SheetBarItem(props: IBaseSheetBarProps) {
    const { sheetId, label, color, selected } = props;

    const [visible, setVisible] = useState(false);
    const [currentSelected, setCurrentSelected] = useState(selected);

    const commandService = useDependency(ICommandService);
    const themeService = useDependency(ThemeService);

    useEffect(() => {
        // TODO: update too many times?
        setCurrentSelected(selected);
    }, [selected]);

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    const getTextColor = (color: string) => {
        const theme = themeService.getCurrentTheme();
        const darkTextColor = theme.textColor;
        const lightTextColor = theme.colorWhite;
        return new TinyColor(color).isDark() ? lightTextColor : darkTextColor;
    };

    return (
        <Dropdown
            visible={visible}
            trigger={['contextMenu']}
            overlay={
                <Menu
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
                key={sheetId}
                data-id={sheetId}
                className={currentSelected ? `${styles.slideTabActive} ${styles.slideTabItem}` : styles.slideTabItem}
                style={{
                    backgroundColor: !currentSelected && color ? color : '',
                    color: !currentSelected && color ? getTextColor(color) : '',
                    boxShadow:
                        currentSelected && color
                            ? `0px 0px 12px rgba(0, 0, 0, 0.2), inset 0px -2px 0px 0px ${color}`
                            : '',
                }}
            >
                <span className={styles.slideTabSpan}>{label}</span>
            </div>
        </Dropdown>
    );
}
