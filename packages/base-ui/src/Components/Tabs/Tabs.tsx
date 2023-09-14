import React, { ReactNode, useEffect, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames, randomId } from '../../Utils';
import styles from './index.module.less';

// Components interface

// Props of tab pane
export interface BaseTabPaneProps {
    /**
     * TabPane's head display content
     */
    label: ReactNode;

    /**
     * Active status of tab pane
     */
    active?: boolean;

    /**
     * TabPane's key
     */
    keys?: string;

    /**
     * TabPane's id
     */
    id?: string;

    /**
     * Class name of tab pane
     */
    className?: string;

    /**
     * Style of tab pane
     */
    style?: React.CSSProperties;

    /**
     * TabPane's head display content
     */
    children?: ReactNode;
}

// Props of tabs
export interface BaseTabProps extends BaseComponentProps {
    /**
     * Basic style of tabs
     */
    type?: 'card';

    /**
     * Current TabPane's key
     */
    activeKey?: string;

    /**
     * Callback executed when tab is clicked
     */
    onTabClick?: (activeKey: string, e: Event) => void;

    /**
     * Class name of tab container
     */
    className?: string;

    /**
     * Style of tab container
     */
    style?: React.CSSProperties;

    /**
     * Content of tab
     */
    children: Array<React.ReactElement<BaseTabPaneProps, string>>;
}

// Todo: rename component name
/**
 * Tabs Component
 */
export function Tab(props: BaseTabProps) {
    const { type = 'line', className = '' } = props;
    const [active, setActive] = useState<string>(props.activeKey || ''); // Initialize active with the provided activeKey
    const [tabChildren, setTabChildren] = useState<Array<React.ReactElement<BaseTabPaneProps, string>>>(props.children);

    useEffect(() => {
        props.activeKey && setActive(props.activeKey); // Update active state when props.activeKey changes
    }, [props.activeKey]);

    useEffect(() => {
        setTabChildren(props.children); // Update children state when props.children changes
    }, [props.children]);

    const parseNavList = () =>
        tabChildren.map((child) => {
            const { label, keys } = child.props;
            const id = `${randomId('tab')}-${keys}`;
            const tabClassName = active === keys ? `${styles.tabsTab} ${styles.tabsTabActive}` : styles.tabsTab;

            return (
                <div key={id} id={id} onClick={handleClick} className={tabClassName}>
                    {label}
                </div>
            );
        });

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const id = e.currentTarget.id;
        const index = id.lastIndexOf('-');
        const value = id.slice(index + 1);

        setActive(value);

        if (props.onTabClick) {
            props.onTabClick(value, e.nativeEvent);
        }
    };

    return (
        <div className={`${styles.tabs} ${type === 'card' ? `${styles.tabs}-card` : ''} ${className}`}>
            <div className={styles.tabsNav}>
                <div className={styles.tabsNavWrap}>
                    <div className={styles.tabsNavList}>{parseNavList()}</div>
                </div>
            </div>
            <div className={styles.tabsContent}>
                {tabChildren.map((child, index) => (
                    <TabPane label={child.props.label} key={index} keys={child.props.keys} active={child.props.keys === active}>
                        {child.props.children}
                    </TabPane>
                ))}
            </div>
        </div>
    );
}

// tab content
export function TabPane(props: BaseTabPaneProps) {
    const { id, keys, style, children, active } = props;
    return (
        <div id={id && `${id}-panel-${keys}`} role="tabpanel" style={{ ...style }} className={joinClassNames(styles.tabsPanel, active && styles.tabsPanelActive)}>
            {active && children}
        </div>
    );
}
