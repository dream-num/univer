import { Dropdown12 } from '@univerjs/icons';
import React, { useEffect, useRef, useState } from 'react';

import { ICustomComponent } from '../../Common';
import { IValueOption } from '../../services/menu/menu';
import { CustomLabel, NeoCustomLabel } from '../CustomLabel';
import { Dropdown } from '../Dropdown';
import { NextIcon } from '../Icon/Format';
import { Input } from '../Input';
import { BaseItemProps, BaseMenuItem, Item } from '../Item/Item';
import styles from './index.module.less';

// TODO: these type definitions should be moved out of components to menu service

export enum SelectTypes {
    /** 单选 */
    SINGLE,
    /** dropdown with input */
    INPUT,
    COLOR,
    /** 两栏菜单，主按钮会跟着上次的选项发生变化 */
    DOUBLE,
    /** 显示一个固定的值 */
    FIX,
    /** 显示一个固定的值 */
    DOUBLE_FIX,

    /** This should be the only type. The enum would be removed after we finish refactor. */
    NEO,
}

export enum DisplayTypes {
    LABEL,

    /** @deprecated */
    SUFFIX,

    ICON,

    /** Label as color display. */
    COLOR,

    INPUT,

    FONT,

    CUSTOM,
}

export interface BaseSelectChildrenProps extends Omit<BaseItemProps, 'suffix' | 'label' | 'children'> {
    onPressEnter?: (...arg: any) => void;
    children?: BaseSelectChildrenProps[];
    unSelectable?: boolean; //选中后不生效事件
    label?: ICustomComponent | React.ReactNode | string;
    suffix?: ICustomComponent | React.ReactNode | string;
    name?: string;
}

export interface BaseSelectProps {
    type?: SelectTypes;
    children?: BaseSelectChildrenProps[];
    display?: DisplayTypes;
    label?: React.ReactNode;
    onClick?: (...arg: any) => void; //下拉Ul点击事件
    onPressEnter?: (...arg: any) => void;
    onMainClick?: () => void; // 非功能按钮事件
    defaultColor?: string;
    hideSelectedIcon?: boolean;
    className?: string;
    name?: string;
    suffix?: any;
    tooltip?: string;
    value?: string | number;
    icon?: string;
    id?: string;
    options?: IValueOption[];
    title?: string;
    onClose?: () => void;
    max?: number; // input maximum value
    min?: number; // INPUT minimum value
}

export function Select(props: BaseSelectProps) {
    const [menu, setMenu] = useState<BaseMenuItem[]>([]);
    const [color, setColor] = useState(props.defaultColor ?? '#000');
    const [content, setContent] = useState('');
    const [value, setValue] = useState('');
    const ColorRef = useRef(null);
    let onClick: (...arg: any) => void;
    let onPressEnter: (...arg: any[]) => void;

    const resetMenu = (children: BaseSelectChildrenProps[], hideSelectedIcon?: boolean): BaseMenuItem[] => {
        const list: BaseMenuItem[] = [];
        // TODO@wzhudev: ID prop is not handled
        for (let i = 0; i < children.length; i++) {
            let selected = false;
            if (!hideSelectedIcon) {
                selected = children[i].selected ?? false;
            }
            list[i] = { label: '' };
            list[i].label = (
                <Item
                    disabled={children[i].disabled}
                    border={children[i].border}
                    selected={selected}
                    label={children[i].label as string}
                    suffix={children[i].suffix as string}
                ></Item>
            );
            list[i].disabled = children[i].disabled;
            list[i].style = children[i].style;
            list[i].value = children[i].value;
            list[i].className = children[i].className;
            list[i].onClick = children[i].onClick;
            list[i].border = children[i].border;

            if (children[i].children) {
                list[i].children = resetMenu(children[i].children as BaseSelectChildrenProps[]);
            }
        }
        return list;
    };

    const initData = () => {
        const { type, display, children = [], label } = props;
        // TODO@wzhudev: the way of binding onClick is ridiculous. Fix it.
        // 显示值可变
        if (type === 0 || type === 3) {
            if (!children.length) return;
            let index = children.findIndex((item) => item.selected);
            if (index < 0) index = 0;
            const list = handleSelected(index);
            const item = children[index];

            if (display === DisplayTypes.SUFFIX) {
                setContent(item.suffix as string);
                setMenu(list);
            } else {
                setContent(item.label as string);
                setMenu(list);
            }

            onClick = (...arg: any[]) => {
                const item = children[arg[2]];

                props.onClick?.(arg[1], arg[2], arg[3]);

                if (item.unSelectable) {
                    return;
                }

                const list = handleSelected(arg[2]);

                if (display === DisplayTypes.SUFFIX) {
                    setContent(children[arg[2]].suffix as string);
                    setMenu(list);
                } else {
                    setContent(children[arg[2]].label as string);
                    setMenu(list);
                }
            };
        } else if (type === 1) {
            // 输入框
            if (!children.length) return;

            const getLabel = (label: React.ReactNode) => {
                if (label !== null) {
                    if (label === '') return;
                    const index = children.findIndex((item) => label === item.label);
                    const list = handleSelected(index < 0 ? null : index);
                    setContent(label as string);
                    setMenu(list);
                } else {
                    let index = children.findIndex((item) => item.selected);
                    if (index < 0) index = 0;
                    const list = handleSelected(index);
                    const item = children[index];

                    setContent(item.label as string);
                    setMenu(list);
                }
            };

            getLabel(label);

            onClick = (...arg) => {
                props.onClick?.(arg[1], arg[2], arg[3]);

                const list = handleSelected(arg[2]);
                setContent(children[arg[2]].label as string);
                setMenu(list);
            };

            onPressEnter = (e) => {
                const value = e.currentTarget.value;
                props.onPressEnter?.(value);
                getLabel(value);
            };
        } else if (type === 2) {
            // 颜色选择器
            const list = handleSelected(null);
            setMenu(list);

            onClick = () => {
                props.onClick?.(color);
            };
        } else if (type === 4 || type === 5) {
            //固定显示值
            if (!children.length) return;
            let index = children.findIndex((item) => item.selected);
            if (index < 0) index = 0;
            const item = children[index];
            const list = handleSelected(index);
            setMenu(list);
            setValue(item.value);

            onClick = (...arg: any[]) => {
                if (arg.length) {
                    props.onClick?.(arg[1], arg[2], arg[3]);
                    const list = handleSelected(arg[2]);
                    setMenu(list);
                    setValue(children[arg[2]].value);
                } else {
                    props.onClick?.(value);
                }
            };
        }
    };

    useEffect(() => {
        initData();
    }, []);

    useEffect(() => {
        if (props.type === SelectTypes.INPUT) {
            setContent(props.label as string);
        }
    }, [props.label]);

    const handleSelected = (index: number | null): BaseMenuItem[] => {
        const { children = [], hideSelectedIcon } = props;
        if (children.length) {
            children.forEach((item) => {
                item.selected = false;
            });
            if (index !== null) {
                children[index].selected = true;
            }
        }

        const list = resetMenu(children, hideSelectedIcon);
        return list;
    };

    const getType = (type: SelectTypes) => {
        switch (type) {
            case SelectTypes.SINGLE:
                return getSingle();
            case SelectTypes.INPUT: // unused now
                return getInput();
            case SelectTypes.DOUBLE:
                return getDouble();
            case SelectTypes.FIX:
                return getFix();
            case SelectTypes.DOUBLE_FIX:
                return getDoubleFix();
            case SelectTypes.NEO:
                return renderNeo();
            default:
                return null;
        }
    };

    const getSingle = () => {
        const { className = '', tooltip, onMainClick } = props;

        return (
            <div className={`${styles.selectSingle} ${className}`}>
                <Dropdown onMainClick={onMainClick} tooltip={tooltip} menu={{ menu, onClick }} showArrow>
                    <div>
                        <CustomLabel label={content} />
                    </div>
                </Dropdown>
            </div>
        );
    };

    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        console.info('press enter');
        onPressEnter(e);
    };

    const getInput = () => {
        const { className = '', tooltip, onMainClick } = props;

        return (
            <div className={`${styles.selectInput} ${className}`}>
                <Dropdown onMainClick={onMainClick} tooltip={tooltip} menu={{ menu, onClick }}>
                    <Input
                        onBlur={onPressEnter}
                        type="number"
                        value={`${props.label as number}` ?? (content as string)}
                    />
                </Dropdown>
            </div>
        );
    };

    const getDouble = () => {
        const { className = '', tooltip, onClick } = props;

        return (
            <div className={`${styles.selectDouble} ${className}`}>
                <Dropdown onClick={onClick} tooltip={tooltip} menu={{ menu, onClick }} icon={<NextIcon />}>
                    <div className={styles.selectLabel}>
                        <CustomLabel label={content} />
                    </div>
                </Dropdown>
            </div>
        );
    };

    const getFix = () => {
        const { label, className = '', tooltip } = props;

        return (
            <div className={`${styles.selectDouble} ${className}`}>
                <Dropdown tooltip={tooltip} menu={{ menu, onClick }}>
                    <div className={styles.selectLabel}>
                        <CustomLabel label={label} />
                    </div>
                </Dropdown>
            </div>
        );
    };

    const getDoubleFix = () => {
        const { label, className = '', tooltip, onClick, display, value, icon } = props;

        return (
            <div className={`${styles.selectDouble} ${className}`}>
                <Dropdown tooltip={tooltip} onClick={onClick} menu={{ menu, onClick }} icon={<NextIcon />}>
                    <div className={styles.selectLabel}>
                        <CustomLabel display={display} label={label} value={`${value}`} icon={icon} />
                    </div>
                </Dropdown>
            </div>
        );
    };

    const renderNeo = () => {
        const { tooltip, onClick, display, value, icon, title, id, options, type, onClose, max, min } = props;

        const onClickInner = (...args: unknown[]) => {
            onClick?.(args[1] as number | string);
        };

        const onOptionSelect = (option: IValueOption) => {
            onClick?.(option);
        };

        const iconToDisplay = options?.find((o) => o.value === value)?.icon ?? icon;
        const displayInSubMenu =
            display === DisplayTypes.ICON
                ? DisplayTypes.LABEL
                : display === DisplayTypes.INPUT || display === DisplayTypes.FONT
                ? DisplayTypes.LABEL
                : display;

        return (
            <div className={`${styles.selectDouble}`}>
                <Dropdown
                    tooltip={tooltip}
                    onClick={type === SelectTypes.NEO ? () => onClick?.({ value }) : onClick}
                    menu={{
                        menuId: id,
                        options,
                        onClick: onClickInner,
                        onOptionSelect,
                        value,
                        display: displayInSubMenu,
                        onClose,
                    }}
                    icon={<Dropdown12 />}
                >
                    <div className={styles.selectLabel}>
                        <NeoCustomLabel
                            icon={iconToDisplay}
                            display={display}
                            title={title!}
                            value={value}
                            max={max}
                            min={min}
                            onChange={(v) => onClick?.(v)}
                            onFocus={() => {
                                console.info(
                                    'TODO: 需要待Dropdown与Menu分离之后，直接控制Dropdown展示文字大小下拉选项'
                                );
                            }}
                        />
                    </div>
                </Dropdown>
            </div>
        );
    };

    const { type = 0 } = props;
    return <div className={styles.selectComponent}>{getType(type)}</div>;
}
