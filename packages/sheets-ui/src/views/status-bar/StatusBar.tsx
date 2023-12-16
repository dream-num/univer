/**
 * Copyright 2023-present DreamNum Inc.
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

import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useEffect, useState } from 'react';

import { IStatusBarService } from '../../services/status-bar.service';
import type { IStatisticItem } from './CopyableStatisticItem';
import { CopyableStatisticItem } from './CopyableStatisticItem';
import styles from './index.module.less';

const SINGLE_MODE_WIDTH = 800;
const ROW_COUNT_THRESHOLD = 3;

export const StatusBar = () => {
    const [isSingle, setIsSingle] = useState(window.innerWidth < SINGLE_MODE_WIDTH);
    const [show, setShow] = useState(true);

    const statusBarService = useDependency(IStatusBarService);
    const items = statusBarService.getFunctions().map((item, index) => ({
        name: item.func,
        value: 0,
        show: isSingle ? index < 1 : true,
        disable: false,
    }));
    const [statistics, setStatistics] = useState<IStatisticItem[]>(items);
    const showList = statistics.filter((item) => item.show && !item.disable);

    useEffect(() => {
        const subscription = statusBarService.state$.subscribe((item) => {
            if (!item || item.length === 0) {
                setShow(false);
            } else {
                setShow(true);
                const newStatistics = statistics.map((stat) => {
                    const target = item.find((i) => i.func === stat.name);
                    if (target) {
                        stat.value = target.value;
                        stat.disable = false;
                    } else {
                        stat.disable = true;
                    }
                    return stat;
                });
                setStatistics(newStatistics);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [statusBarService]);

    const handleResize = debounce(() => {
        const newSingleState = window.innerWidth < SINGLE_MODE_WIDTH;
        if (isSingle !== newSingleState) {
            if (newSingleState) {
                // keep the items hide except the first show item
                const firstIndex = statistics.findIndex((item) => item.show);
                const newStatistics = statistics.map((stat, index) => {
                    if (index === firstIndex) {
                        stat.show = true;
                    } else {
                        stat.show = false;
                    }
                    return stat;
                });
                setStatistics(newStatistics);
            } else {
                // keep all items show
                const newStatistics = statistics.map((stat) => {
                    stat.show = true;
                    return stat;
                });
                setStatistics(newStatistics);
            }
            setIsSingle(newSingleState);
        }
    }, 100);

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isSingle]);

    let renderContent = null;
    if (showList.length > ROW_COUNT_THRESHOLD) {
        const doubleLineList: IStatisticItem[][] = [];
        showList.forEach((_, index) => {
            if (index % 2 === 0) {
                doubleLineList.push(showList.slice(index, index + 2));
            }
        });
        renderContent = (
            <>
                {' '}
                {doubleLineList!.map((item: IStatisticItem[]) => (
                    <div className={styles.statisticListColumn}>
                        {item?.[0] && <CopyableStatisticItem key={item?.[0].name} {...item?.[0]} />}
                        {item?.[1] && <CopyableStatisticItem key={item?.[1].name} {...item?.[1]} />}
                    </div>
                ))}{' '}
            </>
        );
    } else {
        renderContent = (
            <>
                {showList.map((item) => (
                    <CopyableStatisticItem key={item.name} {...item} />
                ))}
            </>
        );
    }

    return (
        show && (
            <div
                className={clsx(styles.statusBar, {
                    [styles.singleMode]: isSingle,
                })}
            >
                <div className={clsx(styles.statisticList)}>{renderContent}</div>
                <div className={styles.statusBarDiv} />
            </div>
        )
    );
};
