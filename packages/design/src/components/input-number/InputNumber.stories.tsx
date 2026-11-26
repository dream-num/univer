/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { Meta } from '@storybook/react';
import { FormLayout } from '../form-layout/FormLayout';
import { InputNumber } from './InputNumber';

const meta: Meta<typeof InputNumber> = {
    title: 'Components / InputNumber',
    component: InputNumber,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const InputNumberBasic = {
    render() {
        return (
            <div className="univer-flex univer-flex-col univer-gap-3">
                <InputNumber className="univer-w-44" defaultValue={2} min={0} max={20} precision={0} />
                <InputNumber className="univer-w-44" defaultValue={0.1} step={0.1} precision={1} min={0} max={10} />
                <InputNumber className="univer-w-44" allowEmpty placeholder="Enter number" />
            </div>
        );
    },
};

export const InputNumberSizes = {
    render() {
        return (
            <div className="univer-flex univer-flex-col univer-gap-3">
                <InputNumber className="univer-w-44" size="mini" defaultValue={12} />
                <InputNumber className="univer-w-44" size="small" defaultValue={12} />
                <InputNumber className="univer-w-44" size="middle" defaultValue={12} />
                <InputNumber className="univer-w-44" size="large" defaultValue={12} />
            </div>
        );
    },
};

export const InputNumberBoundsAndFormatter = {
    render() {
        return (
            <div className="univer-flex univer-flex-col univer-gap-3">
                <InputNumber
                    className="univer-w-44"
                    defaultValue={50}
                    min={0}
                    max={100}
                    step={5}
                    formatter={(v) => `${v}%`}
                    parser={(v) => v?.replace(/%/g, '') ?? ''}
                />
                <InputNumber
                    className="univer-w-44"
                    defaultValue={0}
                    min={0}
                    max={10}
                />
                <InputNumber
                    className="univer-w-44"
                    defaultValue={10}
                    min={0}
                    max={10}
                />
            </div>
        );
    },
};

export const InputNumberDisabled = {
    render() {
        return (
            <div className="univer-flex univer-flex-col univer-gap-3">
                <InputNumber className="univer-w-44" defaultValue={2} disabled />
                <InputNumber className="univer-w-44" placeholder="Disabled" disabled />
            </div>
        );
    },
};

export const InputNumberHideControls = {
    render() {
        return (
            <div>
                <InputNumber className="univer-w-44" defaultValue={24} controls={false} />
            </div>
        );
    },
};

export const InputNumberAllowClear = {
    render() {
        return (
            <div className="univer-flex univer-flex-col univer-gap-3">
                <InputNumber className="univer-w-44" allowClear allowEmpty defaultValue={12} />
                <InputNumber className="univer-w-44" allowClear allowEmpty controls={false} defaultValue={12} />
            </div>
        );
    },
};

export const InputNumberInvalid = {
    render() {
        return (
            <FormLayout label="Decimal places" error="Value must be between 0 and 20">
                <InputNumber className="univer-w-44" defaultValue={2} min={0} max={20} />
            </FormLayout>
        );
    },
};

export const InputNumberRtl = {
    render() {
        return (
            <div dir="rtl" className="univer-flex univer-flex-col univer-gap-3">
                <InputNumber className="univer-w-44" defaultValue={12} />
                <InputNumber className="univer-w-44" allowClear allowEmpty defaultValue={12} />
            </div>
        );
    },
};
