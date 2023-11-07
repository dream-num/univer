import { ICommandInfo, ICommandService, toDisposable } from '@univerjs/core';
import { Button, Dropdown } from '@univerjs/design';
import { CheckMarkSingle, Paste } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useCallback, useEffect, useState } from 'react';

import {
    AutoClearContentCommand,
    AutoFillCommand,
    IAutoFillCommandParams,
} from '../../commands/commands/auto-fill.command';
import { RefillCommand } from '../../commands/commands/refill.command';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { APPLY_TYPE } from '../../services/auto-fill/type';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import styles from './index.module.less';

export interface IAnchorPoint {
    row: number;
    col: number;
}

export interface ISmartButtonMenuItem {
    label: string;
    value?: any;
    selected?: boolean;
    index: number;
}

const useUpdate = () => {
    const [_, setState] = useState({});
    return useCallback(() => setState({}), []);
};

const menu = [
    {
        index: 0,
        label: 'copy',
        value: APPLY_TYPE.COPY,
    },
    {
        index: 1,
        label: 'series',
        value: APPLY_TYPE.SERIES,
    },
    {
        index: 2,
        label: 'format only',
        value: APPLY_TYPE.ONLY_FORMAT,
    },
    {
        index: 3,
        label: 'no format',
        value: APPLY_TYPE.NO_FORMAT,
    },
];

export const SmartButton: React.FC<{}> = () => {
    const [visible, setVisible] = useState(false);
    const commandService = useDependency(ICommandService);
    const selectionRenderService = useDependency(ISelectionRenderService);
    const autoFillService = useDependency(IAutoFillService);
    const [anchor, setAnchor] = useState<IAnchorPoint>({ row: -1, col: -1 });
    const [selected, setSelected] = useState<number>(1);
    const forceUpdate = useUpdate();

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id === AutoFillCommand.id) {
                const { endColumn, endRow } = (command?.params as IAutoFillCommandParams).selectionRange;
                setAnchor({ row: endRow, col: endColumn });
            }
            if (command.id === SetScrollOperation.id) {
                forceUpdate();
            }
            if (command.id === SetCellEditVisibleOperation.id || command.id === AutoClearContentCommand.id) {
                setAnchor({ row: -1, col: -1 });
            }
        });
        return disposable.dispose;
    }, [forceUpdate, commandService]);

    useEffect(() => {
        const disposable = toDisposable(
            autoFillService.applyType$.subscribe((type) => {
                setSelected(menu.find((i) => i.value === type)?.index ?? 0);
            })
        );
        return disposable.dispose;
    }, [autoFillService]);

    if (anchor.col < 0 || anchor.row < 0) {
        return null;
    }
    const skeleton = selectionRenderService.getSkeleton();
    const viewport = selectionRenderService.getViewPort();
    const scene = selectionRenderService.getScene();
    const scaleX = scene?.scaleX;
    const scaleY = scene?.scaleY;
    const scrollXY = scene?.getScrollXY(viewport);
    if (!scaleX || !scene || !scaleX || !scaleY || !scrollXY) return null;
    const x = skeleton?.getNoMergeCellPositionByIndex(anchor.row, anchor.col, scaleX, scaleY).endX || 0;
    const y = skeleton?.getNoMergeCellPositionByIndex(anchor.row, anchor.col, scaleX, scaleY).endY || 0;
    const relativeX = skeleton?.convertTransformToOffsetX(x, scaleX, scrollXY);
    const relativeY = skeleton?.convertTransformToOffsetY(y, scaleY, scrollXY);

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    const handleClick = (item: ISmartButtonMenuItem) => {
        commandService.executeCommand(RefillCommand.id, { type: item.value });
    };
    return (
        <div style={{ left: `${relativeX}px`, top: `${relativeY}px`, position: 'absolute' }}>
            <Dropdown
                placement="bottomRight"
                trigger={['click']}
                overlay={
                    <ul className={styles.smartButtonMenu} style={{ ...styles }}>
                        {menu.map((item) => (
                            <li
                                key={item.index}
                                onClick={(e) => handleClick(item)}
                                className={styles.smartButtonMenuItem}
                            >
                                <span className={styles.smartButtonMenuItemIcon}>
                                    {item.index === selected ? <CheckMarkSingle /> : ''}
                                </span>
                                <span className={styles.smartButtonMenuItemTitle}>{item.label}</span>
                            </li>
                        ))}
                    </ul>
                }
                visible={visible}
                onVisibleChange={onVisibleChange}
            >
                <Button size="small">
                    <Paste style={{ color: 'green' }}></Paste>
                </Button>
            </Dropdown>
        </div>
    );
};
