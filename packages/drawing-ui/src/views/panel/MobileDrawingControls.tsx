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

import type { ComponentProps } from 'react';
import type { IDrawingAlignProps } from './DrawingAlign';
import type { IDrawingGroupProps } from './DrawingGroup';
import type { IDrawingTransformProps } from './DrawingTransform';
import { Button, Checkbox, clsx, InputNumber, MobileSelect } from '@univerjs/design';
import { DrawingAlign } from './DrawingAlign';
import { DrawingGroup } from './DrawingGroup';
import { DrawingTransform } from './DrawingTransform';

function MobileDrawingInputNumber(props: ComponentProps<typeof InputNumber>) {
    return (
        <InputNumber
            {...props}
            controls={false}
            className={clsx('univer-h-12 univer-w-full', props.className)}
            inputClassName={clsx('[&_input]:!univer-h-12 [&_input]:!univer-text-base', props.inputClassName)}
        />
    );
}

function MobileDrawingCheckbox(props: ComponentProps<typeof Checkbox>) {
    return <Checkbox {...props} className={clsx('univer-flex univer-min-h-12 univer-items-center univer-justify-center', props.className)} />;
}

function MobileDrawingButton(props: ComponentProps<typeof Button>) {
    return (
        <Button
            {...props}
            className={clsx(`
              univer-flex univer-min-h-12 univer-flex-1 univer-items-center univer-justify-center univer-gap-2
              univer-text-base
            `, props.className)}
        />
    );
}

export function MobileDrawingTransform(props: IDrawingTransformProps) {
    return <DrawingTransform {...props} InputNumberComponent={MobileDrawingInputNumber} CheckboxComponent={MobileDrawingCheckbox} />;
}

export function MobileDrawingAlign(props: IDrawingAlignProps) {
    return <DrawingAlign {...props} SelectComponent={MobileSelect} />;
}

export function MobileDrawingGroup(props: IDrawingGroupProps) {
    return <DrawingGroup {...props} ButtonComponent={MobileDrawingButton} />;
}
