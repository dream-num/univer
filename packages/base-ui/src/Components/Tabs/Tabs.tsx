// export class Tab extends PureComponent<BaseTabProps> {
//     state = {
//         active: '',
//     };
//     setValue = (value: object, fn?: () => void) => {
//         this.setState(
//             (prevState) => ({
//                 ...value,
//             }),
//             fn
//         );
//     };
//     UNSAFE_componentWillMount() {
//         this.setValue({ active: this.props.activeKey, children: this.props.children });
//     }
//     // generate tab navlist
//     parseNavList = () => {
//         const { active } = this.state;
//         return toChildArray(this.props.children).map((node) => {
//             const { tab, keys } = (node as JSX.Element).props;
//             const id = `${randomId('tab')}-${keys}`;
//             if (active === keys) {
//                 return (
//                     <div key={id} id={id} onClick={this.handleClick} className={joinClassNames(styles.tabsTab, styles.tabsTabActive)}>
//                         {tab}
//                     </div>
//                 );
//             }
//             return (
//                 <div key={id} id={id} onClick={this.handleClick} className={styles.tabsTab}>
//                     {tab}
//                 </div>
//             );
//         });
//     };
//     handleClick = (e: Event) => {
//         const id = (e.target as HTMLElement).id;
//         const index = id.lastIndexOf('-');
//         const value = id.slice(index + 1);
//         this.setValue({ active: value });
//         this.props.onTabClick?.(value, e);
//     };
//     render() {
//         const { children, type = 'line', className = '' } = this.props;
//         const classes = joinClassNames(
//             styles.tabs,
//             {
//                 [`${styles.tabs}-card`]: type === 'card',
//             },
//             className
//         );
//         // if (type == 'line') {
//         //     return <div></div>;
//         // }
//         return (
//             <div className={classes}>
//                 <div className={styles.tabsNav}>
//                     <div className={styles.tabsNavWrap}>
//                         <div className={styles.tabsNavList}>{this.parseNavList()}</div>
//                     </div>
//                 </div>
//                 <div className={styles.tabsContent}>
//                     {children.map((item: JSX.Element, index: number) => (
//                         <TabPane key={index} keys={item.props.keys} active={item.props.keys === this.state.active}>
//                             {item.props.children}
//                         </TabPane>
//                     ))}
//                 </div>
//             </div>
//         );
//     }
// }

// interface IProps {
//     className?: string;
//     style?: JSX.CSSProperties;
//     children?: any;
// }
// interface TabBaseProps extends IProps {
//     // type?: 'line' | 'card';
//     type?: 'card';
//     activeKey?: string;
//     // defaultActiveKey?: string;
//     // tabBarGutter?: number;
//     // tabBarStyle?: Record<string, string>;
//     // tabPosition?: 'left' | 'right' | 'top' | 'bottom';
//     // onChange?: (activeKey: string) => void;
//     onTabClick?: (activeKey: string, e: Event) => void;
// }
// interface TabPaneProps {
//     active?: boolean;
//     tab?: JSX.Element | string;
//     keys?: string;
//     id?: string;
//     className?: string;
//     style?: JSX.CSSProperties;
//     children?: ComponentChildren;
// }
import React, { useEffect, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames, randomId } from '../../Utils';
import styles from './index.module.less';

interface IProps {
    className?: string;
    style?: React.CSSProperties;
    children?: any;
}

export interface BaseTabPaneProps {
    active?: boolean;
    tab?: JSX.Element | string;
    keys?: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: any;
}

export interface BaseTabProps extends IProps, BaseComponentProps {
    type?: 'card';
    activeKey?: string;
    onTabClick?: (activeKey: string, e: Event) => void;
}

export function Tab(props: BaseTabProps) {
    const { children, type = 'line', className = '' } = props;
    const [active, setActive] = useState<string>(props.activeKey || ''); // Initialize active with the provided activeKey
    const [tabChildren, setTabChildren] = useState<any>(props.children);

    useEffect(() => {
        props.activeKey && setActive(props.activeKey); // Update active state when props.activeKey changes
    }, [props.activeKey]);

    useEffect(() => {
        setTabChildren(props.children); // Update children state when props.children changes
    }, [props.children]);

    const parseNavList = () =>
        React.Children.map(tabChildren, (child) => {
            const { tab, keys } = (child as React.ReactElement).props;
            const id = `${randomId('tab')}-${keys}`;
            const tabClassName = active === keys ? `${styles.tabsTab} ${styles.tabsTabActive}` : styles.tabsTab;

            return (
                <div key={id} id={id} onClick={handleClick} className={tabClassName}>
                    {tab}
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
                {React.Children.map(tabChildren, (child, index) => (
                    <TabPane key={index} keys={(child as React.ReactElement).props.keys} active={(child as React.ReactElement).props.keys === active}>
                        {(child as React.ReactElement).props.children}
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
