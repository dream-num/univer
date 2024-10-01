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

import { MoreDownSingle } from '@univerjs/icons';
import clsx from 'clsx';
import RcSelect from 'rc-select';

import React, { useContext } from 'react';
import type { LabelInValueType } from 'rc-select/lib/Select';
import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

interface IOption {
    label?: string | React.ReactNode;
    value?: string;
    options?: IOption[];
}

export interface ISelectProps {
    /**
     * The value of select
     */
    value: string;

    /**
     * The options of select
     * @default []
     */
    options?: IOption[];

    /**
     * The callback function that is triggered when the value is changed
     */
    onChange: (value: string) => void;

    style?: React.CSSProperties;

    /**
     * Whether the borderless style is used
     * @default false
     */
    borderless?: boolean;

    className?: string;
    /**
     * select mode
     */
    mode?: 'combobox' | 'multiple' | 'tags' | undefined;

    dropdownRender?: (
        menu: React.ReactElement<any, string | React.JSXElementConstructor<any>>
    ) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;

    labelRender?: ((props: LabelInValueType) => React.ReactNode) | undefined;

    open?: boolean;

    dropdownStyle?: React.CSSProperties;

    onDropdownVisibleChange?: (open: boolean) => void;

    disabled?: boolean;
}

export function Select(props: ISelectProps) {
    const {
        value,
        options = [],
        onChange,
        style,
        className,
        mode,
        borderless = false,
        dropdownRender,
        labelRender,
        open,
        dropdownStyle,
        onDropdownVisibleChange,
        disabled,
    } = props;

    const { mountContainer, locale } = useContext(ConfigContext);

    const _className = clsx(className, {
        [styles.selectBorderless]: borderless,
    });

    return mountContainer && (
        <RcSelect
            mode={mode}
            prefixCls={styles.select}
            getPopupContainer={() => mountContainer}
            options={options}
            value={value}
            menuItemSelectedIcon={null}
            suffixIcon={<MoreDownSingle />}
            onChange={onChange}
            style={style}
            className={_className}
            dropdownRender={dropdownRender}
            labelRender={labelRender}
            open={open}
            dropdownStyle={dropdownStyle}
            onDropdownVisibleChange={onDropdownVisibleChange}
            notFoundContent={locale?.Select.empty}
            disabled={disabled}
        />
    );
}
