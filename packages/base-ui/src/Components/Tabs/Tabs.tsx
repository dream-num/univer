import { BaseTabPaneProps, BaseTabProps, joinClassNames, JSXComponent, randomId, TabComponent, TabPaneComponent } from '@univerjs/base-ui';
import { JSX, toChildArray } from 'preact';
import { PureComponent } from 'preact/compat';
import styles from './index.module.less';

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

type BaseTabState = {
    active: string;
};

export class Tab extends PureComponent<BaseTabProps> {
    state = {
        active: '',
    };

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    componentWillMount() {
        this.setValue({ active: this.props.activeKey, children: this.props.children });
    }

    // generate tab navlist
    parseNavList = () => {
        const { active } = this.state;
        return toChildArray(this.props.children).map((node) => {
            const { tab, keys } = (node as JSX.Element).props;
            const id = `${randomId('tab')}-${keys}`;
            if (active === keys) {
                return (
                    <div id={id} onClick={this.handleClick} className={joinClassNames(styles.tabsTab, styles.tabsTabActive)}>
                        {tab}
                    </div>
                );
            }
            return (
                <div id={id} onClick={this.handleClick} className={styles.tabsTab}>
                    {tab}
                </div>
            );
        });
    };

    handleClick = (e: Event) => {
        const id = (e.target as HTMLElement).id;
        const index = id.lastIndexOf('-');
        const value = id.slice(index + 1);

        this.setValue({ active: value });

        this.props.onTabClick?.(value, e);
    };

    render(props: BaseTabProps, state: BaseTabState) {
        const { children, type = 'line', className = '' } = props;
        const classes = joinClassNames(
            styles.tabs,
            {
                [`${styles.tabs}-card`]: type === 'card',
            },
            className
        );
        // if (type == 'line') {
        //     return <div></div>;
        // }
        return (
            <div className={classes}>
                <div className={styles.tabsNav}>
                    <div className={styles.tabsNavWrap}>
                        <div className={styles.tabsNavList}>{this.parseNavList()}</div>
                    </div>
                </div>
                <div className={styles.tabsContent}>
                    {children.map((item: JSX.Element) => (
                        <TabPane keys={item.props.keys} active={item.props.keys === this.state.active}>
                            {item.props.children}
                        </TabPane>
                    ))}
                </div>
            </div>
        );
    }
}

// tab content
export const TabPane = (props: BaseTabPaneProps) => {
    const { id, keys, style, children, active } = props;
    return (
        <div id={id && `${id}-panel-${keys}`} role="tabpanel" style={{ ...style }} className={joinClassNames(styles.tabsPanel, active && styles.tabsPanelActive)}>
            {active && children}
        </div>
    );
};

export class UniverTab implements TabComponent {
    render(): JSXComponent<BaseTabProps> {
        return Tab;
    }
}

export class UniverTabPane implements TabPaneComponent {
    render(): JSXComponent<BaseTabProps> {
        return TabPane;
    }
}
