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
import { ICommandService, IUniverInstanceService, LocaleService, toDisposable } from '@univerjs/core';
import { Checkbox, DropdownLegacy } from '@univerjs/design';
import { convertTransformToOffsetX, convertTransformToOffsetY, IRenderManagerService } from '@univerjs/engine-render';
import { MoreDownSingle, MoreUpSingle } from '@univerjs/icons';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { SheetsSelectionsService } from '@univerjs/sheets';
import type { APPLY_TYPE } from '../../services/auto-fill/type';
import type { IStatisticItem } from '../status-bar/CopyableStatisticItem';

import { clsx } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { useActiveWorkbook } from '../../components/hook';
import { getSheetObject } from '../../controllers/utils/component-tools';
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


const STORAGE_KEY = 'FLOAT_STATISTIC_SELECTED_KEYS';

export const SelectionStatistic: React.FC<{}> = () => {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const localeService = useDependency(LocaleService);
    const statusBarService = useDependency(IStatusBarService);
    const selectionService = useDependency(SheetsSelectionsService);

    const [isExpanded, setExpand] = useState(false);
    const [anchor, setAnchor] = useState<IAnchorPoint>({ row: -1, col: -1 });
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

    //#region stat data
    const [statistics, setStatistics] = useState<IStatisticItem[]>([]);
    useEffect(() => {
        const subscription = statusBarService.state$.subscribe((state) => {
            const item = state?.values;
            if (!item || item.length === 0) {
                setExpand(false);
                setStatistics([]);
            } else {
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
                setStatistics(newStatistics);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [statusBarService]);
    //#endregion



    //#region selection pos
    // position
    const [verticalDirect, setVerticalDirect] = useState<'up' | 'down'>('down');
    const [horizontalDirect, setHorizontalDirect] = useState<'left' | 'right'>('right');

    const setAnchorBySelection = (selections: Nullable<ISelectionWithStyle[]>) => {
        if (!selections || selections.length === 0) {
            setAnchor({ row: -1, col: -1 });
            return;
        }
        const { range, primary } = selections[selections?.length - 1];

        let anchorRow = range.endRow;
        let anchorCol = range.endColumn;
        if ((primary?.startRow || 0) > range.startRow) {
            console.log('into reverse', primary?.startRow, range.endRow);
            anchorRow = range.startRow - 1;
            setVerticalDirect('up');
        } else {
            setVerticalDirect('down');
        }
        if ((primary?.startColumn || 0) > range.startColumn) {
            anchorCol = range.startColumn - 1;
            setHorizontalDirect('left');
        } else {
            setHorizontalDirect('right');
        }

        setAnchor({ row: anchorRow, col: anchorCol });
    };

    useEffect(() => {
        const disposable = toDisposable(
            selectionService.selectionMoveStart$.subscribe((_selections: Nullable<ISelectionWithStyle[]>) => {
                setAnchor({ row: -1, col: -1 });
                setStatistics([]);
                return;
            })
        );
        return disposable.dispose;
    }, [selectionService]);

    useEffect(() => {
        const disposable = toDisposable(
            selectionService.selectionMoving$.subscribe((selections: Nullable<ISelectionWithStyle[]>) => {
                setAnchorBySelection(selections);
            })
        );
        return disposable.dispose;
    }, [selectionService]);

    useEffect(() => {
        const disposable = toDisposable(
            selectionService.selectionMoveEnd$.subscribe((selections: Nullable<ISelectionWithStyle[]>) => {
                setAnchorBySelection(selections);
            })
        );
        return disposable.dispose;
    }, [selectionService]);

    useEffect(() => {
        const disposable = toDisposable(
            selectionService.selectionSet$.subscribe((selections: Nullable<ISelectionWithStyle[]>) => {
                setAnchorBySelection(selections);
            })
        );
        return disposable.dispose;
    }, [selectionService]);
    //#endregion


    useEffect(() => {
        function handleClose() {
            setExpand(false);
        }

        document.addEventListener('wheel', handleClose);

        return () => {
            document.removeEventListener('wheel', handleClose);
        };
    }, [isExpanded]);



    //#region LocalStorage
    // Load initial state from localStorage
    const [selectedKeys, setSelectedKeys] = useState([] as string[]);

    useEffect(() => {
        const savedKeys = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        setSelectedKeys(savedKeys);
    }, []);

    // Save state to localStorage on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedKeys));
    }, [selectedKeys]);

    const handleCheckboxChange = (key: string) => {
        setSelectedKeys((prev: string[]) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };
    //#endregion

    const onExpandChange = (visible: boolean) => {
        setExpand(visible);
    };



    if (anchor.col < 0 || anchor.row < 0) {
        return null;
    }

    if (statistics.length === 0) {
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

    const maxStat = statistics.filter((item) => item.name === 'MAX')[0] || { name: 'MAX', value: 0 };

    const menu = (
        <ul className={clsx(styles.selectionStatisticPopupMenu,
            'univer-bg-white',
            'univer-border-gray-200',
            'univer-border-solid',
            'univer-border'
            )}>
            {statistics.map((item) => (
                <li
                    key={item.name}
                    className="univer-flex univer-items-center univer-px-3 univer-py-2 hover:univer-bg-gray-100 univer-text-[12px]"
                >
                    <Checkbox checked={selectedKeys.includes(item.name as string)}
                        onChange={() => handleCheckboxChange(item.name as string)}
                    />
                    <div key={item.name} className={styles.statisticItem}>
                        <span>
                            {`${localeService.t(item.name as string)}: ${item.value}`}
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    );

    return (
        <div
            className={styles.selectionStatisticOuter}
            style={{ left: `${relativeX}px`, top: `${relativeY}px`, position: 'absolute' }}
        >

            <DropdownLegacy
                placement="bottomRight"
                trigger={['click']}
                overlay={menu}
                visible={isExpanded}
                onVisibleChange={onExpandChange}
            >
                <div
                    className={clsx(styles.selectionStatisticLabel, {
                        'univer-bg-gray-100': isExpanded,
                        'univer-right-0': horizontalDirect === 'right',
                        'univer-left-0': horizontalDirect === 'left',
                        'univer-top-1': verticalDirect === 'down',
                        'univer-bottom-1': verticalDirect === 'up',
                    })}
                >
                    <div className={styles.textLabel}>
                        {maxStat.name}: {maxStat.value}
                    </div>
                    {isExpanded ? <MoreUpSingle /> : <MoreDownSingle />}
                </div>
            </DropdownLegacy>
        </div>
    );
};
