/**
 * Copyright 2023 DreamNum Inc.
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

import React, { Component } from 'react';

interface LocationProps {
    config: any;
}
interface LocationState {
    radioGroup: LabelProps[];
    active: string | number;
}
interface LabelProps {
    locale: string;
    label?: string;
    value: string;
    disabled?: boolean;
    children?: LabelProps[];
    checked?: boolean;
}

export class LocationContent extends Component<LocationProps, LocationState> {
    // private _localeObserver: Nullable<Observer<Workbook>>;

    // initialize() {
    //     this.state = {
    //         radioGroup: [],
    //         active: '1',
    //     };
    // }

    // handleChange = (value: string) => {
    //     let { radioGroup } = this.state;
    //     radioGroup.forEach((item) => {
    //         if (item.children) {
    //             item.children.forEach((ele) => {
    //                 ele.disabled = true;
    //             });
    //         }
    //     });

    //     radioGroup.forEach((item) => {
    //         if (item.value === value) {
    //             if (item.children) {
    //                 item.children.forEach((ele) => {
    //                     ele.disabled = false;
    //                 });
    //             }
    //             this.setValue({ active: value, radioGroup });
    //         }
    //     });
    // };

    // handleCheckbox = (value: string[], locale: string) => {
    //     let { radioGroup } = this.state;
    //     let index = radioGroup.findIndex((item) => item.locale === locale);
    //     radioGroup[index].children!.forEach((ele) => {
    //         if (value.includes(ele.value)) {
    //             ele.checked = true;
    //         } else {
    //             ele.checked = false;
    //         }
    //     });
    //     this.setValue({ radioGroup });
    // };

    override render() {
        // const CheckboxGroup = this.Render.renderFunction('CheckboxGroup');
        // const Radio = this.Render.renderFunction('Radio');
        // const RadioGroup = this.Render.renderFunction('RadioGroup');
        // const { radioGroup, active } = this.state;
        return (
            <div />
            // <div className={styles.locationContent}>
            //     <RadioGroup vertical={true} onChange={this.handleChange} active={active}>
            //         {radioGroup.map((item) => {
            //             if (item.children) {
            //                 return (
            //                     <Radio value={item.value} label={item.label}>
            //                         <CheckboxGroup options={item.children} onChange={(value) => this.handleCheckbox(value, item.locale)} />
            //                     </Radio>
            //                 );
            //             }
            //             return <Radio value={item.value} label={item.label}></Radio>;
            //         })}
            //     </RadioGroup>
            // </div>
        );
    }
}
