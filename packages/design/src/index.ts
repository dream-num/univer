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

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

export { Avatar, type IAvatarProps } from './components/avatar';
export { Button, type ButtonSize, type ButtonType, type IButtonProps } from './components/button';
export { CascaderList, type ICascaderListProps } from './components/cascader-list';
export { Checkbox, type ICheckboxProps } from './components/checkbox';
export { CheckboxGroup, type ICheckboxGroupProps } from './components/checkbox-group';
export { ColorPicker, type IColorPickerProps } from './components/color-picker';
export { ConfigContext, ConfigProvider, type IConfigProviderProps } from './components/config-provider';
export { Confirm, type IConfirmProps } from './components/confirm';
export { Container, type IContainerProps } from './components/container';
export { DatePicker, type IDatePickerProps, DatePanel, type IDatePanelProps } from './components/date-picker';
export { Dialog, type IDialogProps } from './components/dialog';
export { Dropdown, type IDropdownProps } from './components/dropdown';
export { FormDualColumnLayout, type IFormDualColumnLayoutProps, FormLayout, type IFormLayoutProps } from './components/form-layout';
export { type IInputProps, type IInputWithSlotProps, Input, InputWithSlot } from './components/input';
export { type IInputNumberProps, InputNumber } from './components/input-number';
export { type MenuRef, Menu, MenuItem, MenuItemGroup, SubMenu } from './components/menu';
export { type IMessageMethodOptions, type IMessageProps, Message, MessageType } from './components/message';
export { type IPagerProps, Pager } from './components/pager';
export { type IPopupProps, Popup, RectPopup, type IRectPopupProps } from './components/popup';
export { type IRadioProps, Radio } from './components/radio';
export { type IRadioGroupProps, RadioGroup } from './components/radio-group';
export { type IScrollbarProps, Scrollbar } from './components/scrollbar';
export { type ISelectProps, Select } from './components/select';
export { type ISelectListProps, SelectList } from './components/select-list';
export { type ISegmentedProps, Segmented } from './components/segmented';
export { type ISliderProps, Slider } from './components/slider';
export { type ITooltipProps, Tooltip, resizeObserverCtor } from './components/tooltip';
export { type ITreeNodeProps, type ITreeProps, Tree, TreeSelectionMode, mergeTreeSelected, findSubTreeFromPath, findNodePathFromTree, filterLeafNode } from './components/tree';
export * as enUS from './locale/en-US';
export * as ruRU from './locale/ru-RU';
export * as zhCN from './locale/zh-CN';
export { Switch } from './components/switch';
export { type ILocale } from './locale/interface';
export { defaultTheme, greenTheme, themeInstance } from './themes';
export { DraggableList, type IDraggableListProps } from './components/draggable-list';
export { Textarea, type ITextareaProps } from './components/textarea';
export { Mentions, type IMentionsProps, Mention, type MentionProps } from './components/mentions';
