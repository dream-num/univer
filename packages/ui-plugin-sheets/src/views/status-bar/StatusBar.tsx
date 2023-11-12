import { FUNCTION_NAMES } from '@univerjs/base-formula-engine';
import { Checkbox, Dropdown } from '@univerjs/design';
import { MoreSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { IStatusBarService } from '../../services/status-bar.service';
import styles from './index.module.less';

export interface statisticItem {
    name: FUNCTION_NAMES;
    value: number;
    show: boolean;
}

export const StatusBar = () => {
    const statusBarService = useDependency(IStatusBarService);
    const items = statusBarService.getFunctions().map((item, index) => ({
        name: item,
        value: 0,
        show: index < 3,
    }));
    const [statistics, setStatistics] = useState<statisticItem[]>(items);
    const onChange = (item: statisticItem) => {
        const newStatistics = statistics.map((stat) => {
            if (stat.name === item.name) {
                stat.show = !stat.show;
            }
            return stat;
        });
        setStatistics(newStatistics);
    };
    const [show, setShow] = useState(true);
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
    return (
        show && (
            <div className={styles.statusBar}>
                <div className={styles.statisticList}>
                    {statistics
                        .filter((item) => item.show)
                        .map((item) => (
                            <div key={item.name} className={styles.statisticItem}>
                                {item.name} = {item.value}
                            </div>
                        ))}
                </div>
                <Dropdown
                    placement="topRight"
                    overlay={
                        <div className={styles.statisticPicker}>
                            {statistics?.map((item) => (
                                <a
                                    key={item.name}
                                    className={`${styles.sliderShortcut}
                                    ${item.show ? styles.statisticActive : ''}`}
                                >
                                    <Checkbox
                                        value={item.name}
                                        checked={item.show}
                                        onChange={() => onChange && onChange(item)}
                                    ></Checkbox>
                                    <span>{`${item.name} = ${item.value}`}</span>
                                </a>
                            ))}
                        </div>
                    }
                >
                    <a className={styles.statisticMore}>
                        <MoreSingle />
                    </a>
                </Dropdown>
            </div>
        )
    );
};
