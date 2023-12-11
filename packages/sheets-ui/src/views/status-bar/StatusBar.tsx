/**
 * Copyright 2023 DreamNum Inc.
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

import { LocaleService } from '@univerjs/core';
import { Checkbox, Dropdown } from '@univerjs/design';
import { MoreSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { IStatusBarService } from '../../services/status-bar.service';
import type { IStatisticItem } from './CopyableStatisticItem';
import { CopyableStatisticItem, formatNumber, functionDisplayNames } from './CopyableStatisticItem';
import styles from './index.module.less';

const SINGLE_MODE_WIDTH = 800;

export const StatusBar = () => {
    const [isSingle, setIsSingle] = useState(window.innerWidth < SINGLE_MODE_WIDTH);
    const [show, setShow] = useState(true);

    const localeService = useDependency(LocaleService);
    const statusBarService = useDependency(IStatusBarService);
    const items = statusBarService.getFunctions().map((item, index) => ({
        name: item,
        value: 0,
        show: isSingle ? index < 1 : index < 3,
    }));
    const [statistics, setStatistics] = useState<IStatisticItem[]>(items);
    const showList = statistics.filter((item) => item.show);

    const onChange = (item: IStatisticItem) => {
        const newStatistics = statistics.map((stat) => {
            if (stat.name === item.name) {
                stat.show = !stat.show;
            } else if (isSingle) {
                stat.show = false;
            }
            return stat;
        });
        setStatistics(newStatistics);
    };

    useEffect(() => {
        const subscription = statusBarService.state$.subscribe((item) => {
            if (!item) {
                setShow(false);
            } else {
                setShow(true);
                const newStatistics = statistics.map((stat) => {
                    const target = item.find((i) => i.func === stat.name);
                    stat.value = target?.value ?? stat.value;
                    return stat;
                });
                setStatistics(newStatistics);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [statusBarService]);

    const handleResize = () => {
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
            }
            setIsSingle(newSingleState);
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        show && (
            <div
                className={clsx(styles.statusBar, {
                    [styles.singleMode]: isSingle,
                })}
            >
                <div
                    className={clsx(styles.statisticList, {
                        [styles.statisticListTwoRow]: showList.length > 3,
                    })}
                >
                    {showList.length > 3 ? (
                        <>
                            <div className={styles.statisticListRow}>
                                {showList.slice(0, 3).map((item) => (
                                    <CopyableStatisticItem key={item.name} {...item} />
                                ))}
                            </div>
                            <div className={styles.statisticListRow}>
                                {showList.slice(3).map((item) => (
                                    <CopyableStatisticItem key={item.name} {...item} />
                                ))}
                            </div>
                        </>
                    ) : (
                        showList.map((item) => <CopyableStatisticItem key={item.name} {...item} />)
                    )}
                </div>
                <Dropdown
                    placement="topRight"
                    overlay={
                        <div className={styles.statisticPicker}>
                            {statistics?.map((item) => (
                                <a key={item.name} className={styles.statisticPickerItem}>
                                    <Checkbox
                                        value={item.name}
                                        checked={item.show}
                                        onChange={() => onChange && onChange(item)}
                                    />
                                    <span>{`${localeService.t(
                                        functionDisplayNames?.[item.name as string] || (item.name as string)
                                    )}: ${formatNumber(item.value)}`}</span>
                                </a>
                            ))}
                        </div>
                    }
                >
                    <div className={styles.statisticMore}>
                        <MoreSingle />
                    </div>
                </Dropdown>
                <div className={styles.statusBarDiv} />
            </div>
        )
    );
};
