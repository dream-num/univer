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

import { CascaderDropdown, type ICascaderDropdownProps } from './cascader-dropdown';
import { ColorDropdown, type IColorDropdownProps } from './color-dropdown';
import { DateDropdown, type IDateDropdownProps } from './date-dropdown';
import { type IListDropdownProps, ListDropDown } from './list-dropdown';

export type ICellDropdown = {
    type: 'datepicker';
    props: IDateDropdownProps;
} | {
    type: 'list';
    props: IListDropdownProps;
} | {
    type: 'color';
    props: IColorDropdownProps;
} | {
    type: 'cascader';
    props: ICascaderDropdownProps;
};

export { CascaderDropdown } from './cascader-dropdown';
export { ColorDropdown } from './color-dropdown';
export { DateDropdown } from './date-dropdown';
export { ListDropDown } from './list-dropdown';

export const dropdownMap = {
    datepicker: DateDropdown,
    list: ListDropDown,
    color: ColorDropdown,
    cascader: CascaderDropdown,
};
