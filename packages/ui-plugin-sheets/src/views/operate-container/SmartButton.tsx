import { IRenderManagerService } from '@univerjs/base-render';
import { ICommandInfo, ICommandService, IUniverInstanceService, LocaleService, toDisposable } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { Autofill, CheckMarkSingle, MoreDownSingle } from '@univerjs/icons';
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
import { getSheetObject } from '../../controllers/utils/component-tools';
import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { APPLY_TYPE } from '../../services/auto-fill/type';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import styles from './index.module.less';

export interface IAnchorPoint {
    row: number;
    col: number;
}

export interface ISmartButtonMenuItem {
    label: string;
    value?: APPLY_TYPE;
    index: number;
    disable: boolean;
}

const useUpdate = () => {
    const [_, setState] = useState({});
    return useCallback(() => setState({}), []);
};

export const SmartButton: React.FC<{}> = () => {
    const commandService = useDependency(ICommandService);
    const sheetSkeletonManagerService = useDependency(SheetSkeletonManagerService);
    const currentUniverService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const selectionRenderService = useDependency(ISelectionRenderService);
    const autoFillService = useDependency(IAutoFillService);
    const localeService = useDependency(LocaleService);
    const [menu, setMenu] = useState<ISmartButtonMenuItem[]>([]);

    const [visible, setVisible] = useState(false);
    const [anchor, setAnchor] = useState<IAnchorPoint>({ row: -1, col: -1 });
    const [selected, setSelected] = useState<APPLY_TYPE>(APPLY_TYPE.SERIES);
    const forceUpdate = useUpdate();

    const sheetObject = getSheetObject(currentUniverService, renderManagerService);

    if (sheetObject == null) {
        return null;
    }
    const { scene } = sheetObject;

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
            autoFillService.menu$.subscribe((menu) => {
                setMenu(menu.map((i) => ({ ...i, index: menu.indexOf(i) })));
            })
        );
        return disposable.dispose;
    }, [autoFillService]);

    useEffect(() => {
        const disposable = toDisposable(
            autoFillService.applyType$.subscribe((type) => {
                setSelected(type);
            })
        );
        return disposable.dispose;
    }, [autoFillService]);

    if (anchor.col < 0 || anchor.row < 0) {
        return null;
    }
    const skeleton = sheetSkeletonManagerService.getCurrent()?.skeleton;
    const viewport = selectionRenderService.getViewPort();
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

    const availableMenu = menu.filter((item) => !item.disable);
    return (
        <div style={{ left: `${relativeX}px`, top: `${relativeY}px`, position: 'absolute' }}>
            <Dropdown
                placement="bottomLeft"
                trigger={['click']}
                overlay={
                    <ul className={styles.smartButtonMenu} style={{ ...styles }}>
                        {availableMenu.map((item) => (
                            <li
                                key={item.index}
                                onClick={(e) => handleClick(item)}
                                className={styles.smartButtonMenuItem}
                            >
                                <span className={styles.smartButtonMenuItemIcon}>
                                    {item.value === selected ? (
                                        <CheckMarkSingle style={{ color: 'rgb(var(--green-700, #409f11))' }} />
                                    ) : (
                                        ''
                                    )}
                                </span>
                                <span className={styles.smartButtonMenuItemTitle}>{localeService.t(item.label)}</span>
                            </li>
                        ))}
                    </ul>
                }
                visible={visible}
                onVisibleChange={onVisibleChange}
            >
                <div className={styles.btnContainer}>
                    <Autofill
                        style={{ color: '#35322B', marginRight: '8px' }}
                        extend={{ colorChannel1: 'rgb(var(--green-700, #409f11))' }}
                    ></Autofill>
                    <MoreDownSingle style={{ color: '#CCCCCC', fontSize: '8px' }}></MoreDownSingle>
                </div>
            </Dropdown>
        </div>
    );
};
