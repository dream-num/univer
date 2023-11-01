import { Dropdown } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';
import React from 'react';

import { ICustomComponent } from '../../Common';
import { IValueOption } from '../../services/menu/menu';
import { NeoCustomLabel } from '../CustomLabel';
import { Menu } from '../Menu/Menu';
import styles from './index.module.less';

// TODO: these type definitions should be moved out of components to menu service

export interface BaseMenuItem {
    className?: string;
    style?: React.CSSProperties;
    label?: React.ReactNode;
    value?: any;
    children?: BaseMenuItem[];
    show?: boolean;
    disabled?: boolean;
    onClick?: (...arg: any) => void;
    border?: boolean;
}
export interface BaseItemProps extends BaseMenuItem {
    selected?: boolean;
    suffix?: React.ReactNode;
    border?: boolean;
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
    children?: BaseSelectChildrenProps[];
    label?:
        | string
        | {
              name: string;
              props?: Record<string, string | number>;
          };
    onClick?: (...arg: any) => void; //下拉Ul点击事件
    onPressEnter?: (...arg: any) => void;
    onMainClick?: () => void; // 非功能按钮事件
    defaultColor?: string;
    hideSelectedIcon?: boolean;
    className?: string;
    name?: string;
    suffix?: any;
    value?: string | number;
    icon?: string;
    id?: string;
    options?: IValueOption[];
    title?: string;
    onClose?: () => void;
    max?: number; // input maximum value
    min?: number; // INPUT minimum value

    onMouseLeave?: React.MouseEventHandler;
}

export function Select(props: BaseSelectProps) {
    const renderNeo = () => {
        const { onClick, ...restProps } = props;
        const { value, icon, title, id, label, options, onClose, max, min } = restProps;

        const onOptionSelect = (option: IValueOption) => {
            onClick?.(option);
        };

        const iconToDisplay = options?.find((o) => o.value === value)?.icon ?? icon;

        return (
            <div className={styles.selectDouble}>
                <Dropdown
                    {...restProps}
                    overlay={
                        <Menu
                            menuType={id}
                            options={options}
                            onOptionSelect={onOptionSelect}
                            value={value}
                            onClose={onClose}
                        />
                    }
                >
                    <div className={styles.selectLabel}>
                        <NeoCustomLabel
                            icon={iconToDisplay}
                            title={title!}
                            value={value}
                            label={label}
                            onChange={(v) => onClick?.(v)}
                        />
                        <div className={styles.selectDropIcon}>
                            <MoreDownSingle />
                        </div>
                    </div>
                </Dropdown>
            </div>
        );
    };

    return <div className={styles.selectComponent}>{renderNeo()}</div>;
}
