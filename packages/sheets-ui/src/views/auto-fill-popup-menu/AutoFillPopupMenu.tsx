/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommandInfo, IExecutionOptions } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, toDisposable } from '@univerjs/core';
import { borderClassName, clsx, DropdownMenu } from '@univerjs/design';
import { convertTransformToOffsetX, convertTransformToOffsetY, IRenderManagerService } from '@univerjs/engine-render';
import { Autofill, MoreDownSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefillCommand } from '../../commands/commands/refill.command';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { useActiveWorkbook } from '../../components/hook';
import { getSheetObject } from '../../controllers/utils/component-tools';
import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { APPLY_TYPE } from '../../services/auto-fill/type';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';

export interface IAnchorPoint {
    row: number;
    col: number;
}

export interface IAutoFillPopupMenuItem {
    label: string;
    value: APPLY_TYPE;
    index: number;
    disable: boolean;
}

const useUpdate = () => {
    const [, setState] = useState({});
    return useCallback(() => setState((prevState) => !prevState), []);
};

export const AutoFillPopupMenu: React.FC<{}> = () => {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const autoFillService = useDependency(IAutoFillService);
    const localeService = useDependency(LocaleService);
    const [menu, setMenu] = useState<IAutoFillPopupMenuItem[]>([]);
    const [visible, setVisible] = useState(false);
    const [anchor, setAnchor] = useState<IAnchorPoint>({ row: -1, col: -1 });
    const [selected, setSelected] = useState<APPLY_TYPE>(APPLY_TYPE.SERIES);
    const [isHovered, setHovered] = useState(false);
    const workbook = useActiveWorkbook();
    const { sheetSkeletonManagerService, selectionRenderService } = useMemo(() => {
        if (workbook) {
            const ru = renderManagerService.getRenderById(workbook.getUnitId());
            return {
                sheetSkeletonManagerService: ru?.with(SheetSkeletonManagerService),
                selectionRenderService: ru?.with(ISheetSelectionRenderService),
            };
        }

        return { sheetSkeletonManagerService: null, selectionRenderService: null };
    }, [workbook, renderManagerService]);

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };
    const forceUpdate = useUpdate();

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
            if (command.id === SetScrollOperation.id) {
                forceUpdate();
            }
        });
        return disposable.dispose;
    }, [forceUpdate, commandService]);

    useEffect(() => {
        const disposable = sheetSkeletonManagerService && toDisposable(
            sheetSkeletonManagerService.currentSkeleton$.subscribe((skeleton) => {
                if (skeleton) {
                    forceUpdate();
                }
            })
        );
        return disposable?.dispose;
    }, [sheetSkeletonManagerService, forceUpdate]);

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
            autoFillService.showMenu$.subscribe((show) => {
                const { source, target } = autoFillService.autoFillLocation || { source: null, target: null };
                if (show && source && target) {
                    const lastRow = Math.max(source.rows[source.rows.length - 1], target.rows[target.rows.length - 1]);
                    const lastCol = Math.max(source.cols[source.cols.length - 1], target.cols[target.cols.length - 1]);
                    setAnchor({ row: lastRow, col: lastCol });
                } else {
                    setAnchor({ row: -1, col: -1 });
                }
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

    useEffect(() => {
        function handleClose() {
            setVisible(false);
        }

        document.addEventListener('wheel', handleClose);

        return () => {
            document.removeEventListener('wheel', handleClose);
        };
    }, [visible]);

    if (anchor.col < 0 || anchor.row < 0) {
        return null;
    }

    const sheetObject = getSheetObject(univerInstanceService, renderManagerService);
    if (!sheetObject || !selectionRenderService) return null;

    const { scene } = sheetObject;
    const skeleton = sheetSkeletonManagerService?.getCurrentSkeleton();
    const viewport = selectionRenderService.getViewPort();
    const scaleX = scene?.scaleX;
    const scaleY = scene?.scaleY;
    const scrollXY = scene?.getViewportScrollXY(viewport);
    if (!scaleX || !scene || !scaleX || !scaleY || !scrollXY) return null;
    const x = skeleton?.getNoMergeCellWithCoordByIndex(anchor.row, anchor.col).endX || 0;
    const y = skeleton?.getNoMergeCellWithCoordByIndex(anchor.row, anchor.col).endY || 0;
    const relativeX = convertTransformToOffsetX(x, scaleX, scrollXY);
    const relativeY = convertTransformToOffsetY(y, scaleY, scrollXY);

    if (relativeX == null || relativeY == null) return null;
    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    const handleClick = (item: IAutoFillPopupMenuItem) => {
        commandService.executeCommand(RefillCommand.id, { type: item.value });
        setVisible(false);
    };

    const showMore = visible || isHovered;

    const availableMenu = menu.filter((item) => !item.disable);

    return (
        <div className="univer-absolute univer-inset-0 univer-z-10 univer-size-0">
            <div
                className="univer-absolute"
                style={{ left: `${relativeX + 2}px`, top: `${relativeY + 2}px` }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <DropdownMenu
                    align="start"
                    items={availableMenu.map((item) => ({
                        type: 'radio',
                        value: selected,
                        options: [{ label: localeService.t(item.label), value: item.value }],
                        onSelect: () => handleClick(item),
                    }))}
                    open={visible}
                    onOpenChange={onVisibleChange}
                >
                    <div
                        className={clsx(`
                          univer-flex univer-items-center univer-gap-2 univer-rounded univer-p-1
                          dark:hover:univer-bg-gray-800
                          hover:univer-bg-gray-100
                        `, borderClassName, {
                            'univer-bg-gray-100 dark:univer-bg-gray-800': visible,
                            'univer-bg-white dark:univer-bg-gray-900': !visible,
                        })}
                    >
                        <Autofill
                            className={`
                              univer-fill-primary-600 univer-text-gray-900
                              dark:univer-text-white
                            `}
                        />
                        {showMore && <MoreDownSingle className="dark:univer-text-white" />}
                    </div>
                </DropdownMenu>
            </div>
        </div>
    );
};
