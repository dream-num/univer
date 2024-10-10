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

import { DataValidationErrorStyle, type IDataValidationRuleOptions, LocaleService } from '@univerjs/core';
import { useDependency } from '@univerjs/core';
import { Checkbox, FormLayout, Input, Radio, RadioGroup } from '@univerjs/design';
import { MoreDownSingle, MoreUpSingle } from '@univerjs/icons';
import { ComponentManager } from '@univerjs/ui';
import React, { useState } from 'react';
import styles from './index.module.less';

export interface IDataValidationOptionsParams {
    value: IDataValidationRuleOptions;
    onChange: (value: IDataValidationRuleOptions) => void;
    extraComponent?: string;
}

export function DataValidationOptions(props: IDataValidationOptionsParams) {
    const localeService = useDependency(LocaleService);
    const componentManager = useDependency(ComponentManager);
    const { value, onChange, extraComponent } = props;
    const [show, setShow] = useState(false);

    const ExtraOptions = extraComponent ? componentManager.get(extraComponent) : null;

    return (
        <>
            <div className={styles.dataValidationOptionsButton} onClick={() => setShow(!show)}>
                {localeService.t('dataValidation.panel.options')}
                {show ? <MoreUpSingle className={styles.dataValidationOptionsButtonIcon} /> : <MoreDownSingle className={styles.dataValidationOptionsButtonIcon} />}
            </div>
            {show && (
                <>
                    {ExtraOptions ? <ExtraOptions value={value} onChange={onChange} /> : null}
                    <FormLayout
                        label={localeService.t('dataValidation.panel.invalid')}
                    >
                        <RadioGroup
                            value={`${value.errorStyle ?? DataValidationErrorStyle.WARNING}`}
                            onChange={(errorStyle) => onChange({ ...value, errorStyle: +errorStyle })}
                        >
                            <Radio value={`${DataValidationErrorStyle.WARNING}`}>
                                {localeService.t('dataValidation.panel.showWarning')}
                            </Radio>
                            <Radio value={`${DataValidationErrorStyle.STOP}`}>
                                {localeService.t('dataValidation.panel.rejectInput')}
                            </Radio>
                        </RadioGroup>
                    </FormLayout>
                    <FormLayout
                        label={localeService.t('dataValidation.panel.messageInfo')}
                    >
                        <Checkbox
                            checked={value.showErrorMessage}
                            onChange={() => onChange({
                                ...value,
                                showErrorMessage: !value.showErrorMessage,
                            })}
                        >
                            {localeService.t('dataValidation.panel.showInfo')}
                        </Checkbox>
                    </FormLayout>
                    {value.showErrorMessage
                        ? (
                            <FormLayout>
                                <Input value={value.error} onChange={(error) => onChange({ ...value, error })} />
                            </FormLayout>
                        )
                        : null}
                </>
            )}
        </>
    );
}
