import React, { createRef, ReactNode, useEffect, useImperativeHandle, useState } from 'react';

import { joinClassNames, randomId } from '../../Utils';
import styles from './index.module.less';

// Components interface

// Props of tab pane
export interface IBaseTabPaneProps {
    /**
     * TabPane's head display content
     */
    children?: ReactNode;

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
    label: ReactNode;

    /**
     * Active status of tab pane
     */
    active?: boolean;

    /**
     * TabPane's key
     */
    keys?: string;
}

// Props of tabs
export interface IBaseTabsProps {
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
    children: Array<React.ReactElement<IBaseTabPaneProps, string>>;

    /**
     * Tab pane is draggable
     * @default false
     */
    draggable?: boolean;
    /**
     * Re-render when it changes
     */
    reRenderString?: string;
}

interface ITabInfo {
    min: number;
    max: number;
}

export interface ITabRef {
    scrollContent: (offset: number) => void;
}

/**
 * Tabs Component
 */
export const Tabs = React.memo(
    React.forwardRef<ITabRef, IBaseTabsProps>((props: IBaseTabsProps, ref) => {
        const { type = 'line', className = '', draggable = false } = props;
        const [active, setActive] = useState<string>(props.activeKey ?? ''); // Initialize active with the provided activeKey
        const parent = createRef<HTMLDivElement>();

        useEffect(() => {
            props.activeKey && setActive(props.activeKey); // Update active state when props.activeKey changes
        }, [props.activeKey]);

        const parseNavList = () =>
            props.children.map((child) => {
                const { label, keys, className = '' } = child.props;
                const id = `${randomId('tab')}-${keys}`;
                const tabClassName =
                    active === keys
                        ? `${styles.tabsTab} ${className} ${styles.tabsTabActive}`
                        : `${styles.tabsTab} ${className}`;

                return (
                    <div
                        key={id}
                        id={id}
                        onClick={handleClick}
                        className={tabClassName}
                        onMouseDown={draggable ? (e: any) => dragStart(e) : undefined}
                    >
                        {label}
                    </div>
                );
            });

        const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            const id = e.currentTarget.id;
            const index = id.lastIndexOf('-');
            const value = id.slice(index + 1);

            setActive(value);

            if (props.onTabClick) {
                props.onTabClick(value, e.nativeEvent);
            }
        };

        // 拖拽逻辑
        let target: HTMLDivElement | null;
        let startX: number;
        let left: number;
        let parentOffsetLeft: number;
        let parentOffsetTop: number;
        let list: ITabInfo[] = [];
        let nextIndex = 0;
        let previousIndex = 0;
        // 滚轮滚动距离
        let wheelDistance = 0;
        // 超出右边界再回来
        let overRight = false;
        // 超出左边界再回来
        let overLeft = false;
        let startTime: number;
        // requestAnimationFrameId
        let scrollToRightId: number;

        const getDistance = (element: HTMLDivElement, direction: 'Left' | 'Top' = 'Left') => {
            let distance = 0;

            while (element) {
                distance += element[`offset${direction}`];
                element = element.offsetParent as HTMLDivElement;
            }
            return distance;
        };

        const getList = (parent: HTMLDivElement) => {
            const list: ITabInfo[] = [];
            Array.from(parent.children).forEach((item) => {
                const divItem = item as HTMLDivElement;
                list.push({
                    min: divItem.offsetLeft,
                    max: divItem.offsetLeft + divItem.offsetWidth,
                });
            });
            return list;
        };

        const wheel = (e: React.WheelEvent) => {
            if (!parent.current) return;
            const children = parent.current.children;
            if (e.deltaY > 0) {
                const lastChild = children[children.length - 1] as HTMLDivElement;
                const width = lastChild.offsetLeft + lastChild.offsetWidth - parent.current.offsetWidth;
                wheelDistance = wheelDistance + 100 <= width ? wheelDistance + 100 : width;
                parent.current.scrollTo(wheelDistance, 0);
            } else {
                wheelDistance = wheelDistance - 100 < 0 ? 0 : wheelDistance - 100;
                parent.current.scrollTo(wheelDistance, 0);
            }
        };

        const scrollContent = (offset: number) => {
            if (parent.current) {
                parent.current.scrollLeft += offset;
            }
        };

        useImperativeHandle(ref, () => ({
            scrollContent,
        }));

        // 动画函数
        const scrollToAnimation = (current: HTMLDivElement, direction: 'left' | 'right') => () => {
            let scrollLeft;
            if (direction === 'left') {
                scrollLeft = current.scrollLeft - 2;
            } else {
                scrollLeft = current.scrollLeft + 2;
            }
            current.scrollTo(scrollLeft, 0);
            scrollToRightId = requestAnimationFrame(scrollToAnimation(current, direction));
        };

        const drag = (e: MouseEvent) => {
            const time = new Date().getTime();
            if (time - startTime < 300) return;
            cancelAnimationFrame(scrollToRightId);

            const current = parent.current;
            if (!current || !target) return;
            const diff = e.pageX - startX;
            const distance = left + diff;
            if (e.pageX > parentOffsetLeft + current.offsetWidth) {
                target.style.left = `${parentOffsetLeft + current.offsetWidth}px`;
                scrollToAnimation(current, 'right')();
                overRight = true;
            } else if (e.pageX < parentOffsetLeft) {
                target.style.left = `${parentOffsetLeft - target.offsetWidth}px`;
                scrollToAnimation(current, 'left')();
                overLeft = true;
            } else {
                target.style.left = `${distance}px`;
                // 相对父元素的offsetLeft
                const offsetLeft = e.pageX + current.scrollLeft - parentOffsetLeft;

                // 超出边界再回来时，把相应的tab挤掉
                requestAnimationFrame(() => {
                    if (!target) return;
                    if (overRight || overLeft) {
                        if (nextIndex < current.children.length) {
                            const item = current.children[nextIndex] as HTMLDivElement;
                            item.style.marginRight = '0';
                            item.style.marginLeft = '0';
                        }
                        if (previousIndex > -1) {
                            const item = current.children[previousIndex] as HTMLDivElement;
                            item.style.marginLeft = '0';
                            item.style.marginRight = '0';
                        }

                        let index = list.findIndex((item) => offsetLeft >= item.min && offsetLeft <= item.max);
                        if (offsetLeft > list[list.length - 1].max) index = current.children.length - 1;

                        if (index < 1) {
                            const item = current.children[0] as HTMLDivElement;
                            item.style.marginLeft = `${target.offsetWidth}px`;
                            previousIndex = -1;
                            nextIndex = 0;
                        } else if (index === current.children.length - 1) {
                            const item = current.children[index] as HTMLDivElement;
                            item.style.marginRight = `${target.offsetWidth}px`;
                            previousIndex = index;
                            nextIndex = current.children.length;
                        } else {
                            const item = current.children[index - 1] as HTMLDivElement;
                            item.style.marginRight = `${target.offsetWidth}px`;
                            previousIndex = index - 1;
                            nextIndex = index;
                        }
                    }
                });

                if (nextIndex < current.children.length && offsetLeft > list[nextIndex].min) {
                    const nextElement = current.children[nextIndex] as HTMLDivElement;
                    const previousElement = current.children[previousIndex] as HTMLDivElement;
                    nextElement.style.marginRight = `${target.offsetWidth}px`;
                    nextElement.style.marginLeft = '0';
                    if (previousIndex > -1) {
                        previousElement.style.marginRight = '0';
                        previousElement.style.marginLeft = '0';
                    }
                    previousIndex = nextIndex;
                    nextIndex += 1;
                } else if (previousIndex > -1 && offsetLeft < list[previousIndex].max) {
                    const nextElement = current.children[nextIndex] as HTMLDivElement;
                    const previousElement = current.children[previousIndex] as HTMLDivElement;
                    previousElement.style.marginLeft = `${target.offsetWidth}px`;
                    previousElement.style.marginRight = '0';
                    if (nextIndex < current.children.length) {
                        nextElement.style.marginLeft = '0';
                        nextElement.style.marginRight = '0';
                    }
                    nextIndex = previousIndex;
                    previousIndex -= 1;
                }
                list = getList(current);
                overLeft = false;
                overRight = false;
            }
        };

        const dragEnd = () => {
            cancelAnimationFrame(scrollToRightId);

            overLeft = false;
            overRight = false;
            window.removeEventListener('mousemove', drag);
            window.removeEventListener('mouseup', dragEnd);

            const current = parent.current;
            if (!current || !target) return;

            const previousElement = current.children[previousIndex > -1 ? previousIndex : 0] as HTMLDivElement;
            previousElement.style.marginLeft = '0';
            previousElement.style.marginRight = '0';
            const nextElement = current.children[
                nextIndex < current.children.length ? nextIndex : current.children.length - 1
            ] as HTMLDivElement;
            nextElement.style.marginLeft = '0';
            nextElement.style.marginRight = '0';
            target.style.position = 'relative';
            target.style.left = '0';
            target.style.top = '0';
            current.insertBefore(target, current.children[nextIndex]) as HTMLDivElement;
        };

        const dragStart = (e: MouseEvent) => {
            requestAnimationFrame(() => {
                startTime = new Date().getTime();
                startX = e.pageX;
                window.addEventListener('mousemove', drag);
                window.addEventListener('mouseup', dragEnd);
                target = (e.target as HTMLElement).closest(`.${styles.tabsTab}`);
                if (!target) return;
                const width = target.offsetWidth;
                const nextElement = target.nextElementSibling as HTMLDivElement;
                const previousElement = target.previousElementSibling as HTMLDivElement;
                const targetOffsetLeft = target.offsetLeft;
                const targetOffsetTop = target.offsetTop;
                const current = parent.current;
                if (!current) return;
                parentOffsetLeft = getDistance(parent.current, 'Left');
                parentOffsetTop = getDistance(parent.current, 'Top');
                // 点击时距离左边的距离
                left = targetOffsetLeft + parentOffsetLeft - current.scrollLeft;
                target.style.left = `${targetOffsetLeft + parentOffsetLeft - current.scrollLeft}px`;
                target.style.top = `${targetOffsetTop + parentOffsetTop - current.scrollTop}px`;
                // current.removeChild(target);
                if (previousElement) {
                    previousElement.style.marginRight = `${width}px`;
                } else {
                    nextElement.style.marginLeft = `${width}px`;
                }
                document.body.appendChild(target);
                target.style.position = 'absolute';
                // TODO: CSS变量挂在container上，container外层取不到
                target.style.fontSize = '14px';
                list = getList(current);
                nextIndex = nextElement
                    ? list.findIndex((item) => item.min === nextElement.offsetLeft)
                    : current.children.length;
                previousIndex = previousElement
                    ? list.findIndex((item) => item.min === previousElement.offsetLeft)
                    : -1;
            });
        };

        return (
            <div className={`${styles.tabs} ${type === 'card' ? `${styles.tabs}-card` : ''} ${className}`}>
                <div className={styles.tabsNav}>
                    <div className={styles.tabsNavWrap}>
                        <div className={styles.tabsNavList} ref={parent} onWheel={wheel}>
                            {parseNavList()}
                        </div>
                    </div>
                </div>
                <div className={styles.tabsContent}>
                    {props.children.map((child, index) => (
                        <TabPane
                            label={child.props.label}
                            key={index}
                            keys={child.props.keys}
                            active={child.props.keys === active}
                        >
                            {child.props.children}
                        </TabPane>
                    ))}
                </div>
            </div>
        );
    }),
    (prev, next) =>
        prev.children.length === next.children.length &&
        prev.activeKey === next.activeKey &&
        prev.reRenderString === next.reRenderString
);

// tab content
export function TabPane(props: IBaseTabPaneProps) {
    const { id, keys, style, children, active } = props;
    return (
        <div
            id={id && `${id}-panel-${keys}`}
            role="tabpanel"
            className={joinClassNames(styles.tabsPanel, active && styles.tabsPanelActive)}
            style={{ ...style }}
        >
            {active && children}
        </div>
    );
}
