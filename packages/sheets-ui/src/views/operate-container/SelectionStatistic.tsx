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

import type { ICommandInfo, IExecutionOptions, Nullable } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { APPLY_TYPE } from '../../services/auto-fill/type';
import type { IStatisticItem } from '../status-bar/CopyableStatisticItem';
import { ICommandService, IUniverInstanceService, LocaleService, toDisposable } from '@univerjs/core';
import { DropdownLegacy } from '@univerjs/design';
import { convertTransformToOffsetX, convertTransformToOffsetY, IRenderManagerService } from '@univerjs/engine-render';
import { Autofill, MoreDownSingle, MoreUpSingle } from '@univerjs/icons';
import { SheetsSelectionsService } from '@univerjs/sheets';

import { useDependency } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { useActiveWorkbook } from '../../components/hook';
import { getSheetObject } from '../../controllers/utils/component-tools';
import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { IStatusBarService } from '../../services/status-bar.service';
import styles from './index.module.less';

export interface IAnchorPoint {
    row: number;
    col: number;
}

export interface IAutoFillPopupMenuItem {
    label: string;
    value?: APPLY_TYPE;
    index: number;
    disable: boolean;
}

const useUpdate = () => {
    const [, setState] = useState({});
    return useCallback(() => setState((prevState) => !prevState), []);
};

export const SelectionStatistic: React.FC<{}> = () => {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    // const autoFillService = useDependency(IAutoFillService);
    const localeService = useDependency(LocaleService);
    const statusBarService = useDependency(IStatusBarService);
    const selectionService = useDependency(SheetsSelectionsService);

    // const [menu, setMenu] = useState<IAutoFillPopupMenuItem[]>([]);
    const [isExpanded, setExpand] = useState(false);
    const [anchor, setAnchor] = useState<IAnchorPoint>({ row: -1, col: -1 });
    // const [selected, setSelected] = useState<APPLY_TYPE>(APPLY_TYPE.SERIES);
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
            }));
        return disposable?.dispose;
    }, [sheetSkeletonManagerService, forceUpdate]);

    // useEffect(() => {
    //     const disposable = toDisposable(
    //         autoFillService.menu$.subscribe((menu) => {
    //             setMenu(menu.map((i) => ({ ...i, index: menu.indexOf(i) })));
    //         })
    //     );
    //     return disposable.dispose;
    // }, [autoFillService]);
    const [statistics, setStatistics] = useState<IStatisticItem[]>([]);
    useEffect(() => {
        const subscription = statusBarService.state$.subscribe((state) => {
            const item = state?.values;
            if (!item || item.length === 0) {
                setExpand(false);
                setStatistics([]);
            } else {
                // setExpand(true);
                const newStatistics = state.values.map((stat) => {
                    const staticItem: IStatisticItem = {
                        value: stat.value,
                        name: stat.func,
                        show: true,
                        disable: false,
                        pattern: '',
                    };
                    return staticItem;
                });
                console.log('newStatistics', newStatistics);
                setStatistics(newStatistics);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [statusBarService]);

    // useEffect(() => {
    //   const disposable = toDisposable(
    //     autoFillService.showMenu$.subscribe((show) => {
    //       const { source, target } = autoFillService.autoFillLocation || { source: null, target: null };
    //       if (show && source && target) {
    //         const lastRow = Math.max(source.rows[source.rows.length - 1], target.rows[target.rows.length - 1]);
    //         const lastCol = Math.max(source.cols[source.cols.length - 1], target.cols[target.cols.length - 1]);
    //         setAnchor({ row: lastRow, col: lastCol });
    //       } else {
    //         setAnchor({ row: -1, col: -1 });
    //       }
    //     })
    //   );
    //   return disposable.dispose;
    // }, [autoFillService]);

    // position

    useEffect(() => {
        const disposable = toDisposable(
            selectionService.selectionMoveStart$.subscribe((selections: Nullable<ISelectionWithStyle[]>) => {
                setAnchor({ row: -1, col: -1 });
                setStatistics([]);
                return
            })
        );
        return disposable.dispose;
    }, [selectionService]);

    useEffect(() => {
        const disposable = toDisposable(
            selectionService.selectionMoving$.subscribe((selections: Nullable<ISelectionWithStyle[]>) => {
                if (!selections || selections.length === 0) {
                    setAnchor({ row: -1, col: -1 });
                    return
                }
                const { range } = selections[selections?.length - 1];
                console.log('range', range)
                setAnchor({ row: range.endRow, col: range.endColumn });
            })
        );
        return disposable.dispose;
    }, [selectionService]);

    useEffect(() => {
        const disposable = toDisposable(
            selectionService.selectionMoveEnd$.subscribe((selections: Nullable<ISelectionWithStyle[]>) => {
                if (!selections || selections.length === 0) {
                    setAnchor({ row: -1, col: -1 });
                    return
                }
                const { range } = selections[selections?.length - 1];
                setAnchor({ row: range.endRow, col: range.endColumn });
            })
        );
        return disposable.dispose;
    }, [selectionService]);

    useEffect(() => {
        const disposable = toDisposable(
            selectionService.selectionSet$.subscribe((selections: Nullable<ISelectionWithStyle[]>) => {
                if (!selections || selections.length === 0) {
                    setAnchor({ row: -1, col: -1 });
                    return
                }
                const { range } = selections[selections?.length - 1];
                setAnchor({ row: range.endRow, col: range.endColumn });
            })
        );
        return disposable.dispose;
    }, [selectionService]);

    // useEffect(() => {
    //     const disposable = toDisposable(
    //         autoFillService.applyType$.subscribe((type) => {
    //             setSelected(type);
    //         })
    //     );
    //     return disposable.dispose;
    // }, [autoFillService]);

    useEffect(() => {
        function handleClose() {
            setExpand(false);
        }

        document.addEventListener('wheel', handleClose);

        return () => {
            document.removeEventListener('wheel', handleClose);
        };
    }, [isExpanded]);

    if (anchor.col < 0 || anchor.row < 0) {
      return null;
    }

    if(statistics.length === 0) {
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
    const relativeX = convertTransformToOffsetX(x, scaleX, scrollXY) - 100;
    const relativeY = convertTransformToOffsetY(y, scaleY, scrollXY);

    if (relativeX == null || relativeY == null) return null;
    const onExpandChange = (visible: boolean) => {
        setExpand(visible);
    };

    // const handleClick = (item: IAutoFillPopupMenuItem) => {
    // commandService.executeCommand(RefillCommand.id, { type: item.value });
    // setVisible(false);
    // };


    // const availableMenu = menu.filter((item) => !item.disable);
    const maxStat = statistics.filter((item) => item.name === 'MAX')[0] || { name: 'MAX', value: 0 };

    return (
        <div
            className={styles.selectionStatisticOuter}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ left: `${relativeX + 2}px`, top: `${relativeY + 2}px`, position: 'absolute' }}
        >

            <DropdownLegacy
                placement="bottomLeft"
                trigger={['click']}
                overlay={(
                    <ul className={styles.autoFillPopupMenu}>
                        {statistics.map((item) => (
                            <li
                                key={item.name}
                                className={styles.autoFillPopupMenuItem}
                            >
                                <span className={styles.autoFillPopupMenuItemIcon}>
                                    <div key={item.name} className={styles.statisticItem}>
                                        <span>
                                            {`${localeService.t(item.name as string)}: ${item.value}`}
                                        </span>
                                    </div>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                visible={isExpanded}
                onVisibleChange={onExpandChange}
            >
                <div
                    className={clsx(styles.selectionStatisticLabel, {
                        [styles.btnContainerExpand]: isExpanded,
                    })}
                >
                    <div className={styles.textLabel}>
                        {maxStat.name}: {maxStat.value}
                    </div>
                    {isExpanded ? <MoreUpSingle/> : <MoreDownSingle/>}
                </div>
            </DropdownLegacy>
        </div>
    );
};
