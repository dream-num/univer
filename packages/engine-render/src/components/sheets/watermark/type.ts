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

export enum IWatermarkTypeEnum {
    // UserInfo is provided for use in the plugin registration place and has the highest priority
    UserInfo = 'userInfo',
    Text = 'text',
    Image = 'image',
}

export interface IGeneralWatermarkConfig {
    // origin position
    x: number;
    y: number;
    repeat: boolean;
    // spacing between watermarks
    spacingX: number;
    spacingY: number;
    rotate: number;
    opacity: number;

}

export interface ITextWatermarkConfig extends IGeneralWatermarkConfig {
    content?: string;
    fontSize: number;
    color: string;
    bold: boolean;
    italic: boolean;
    direction: 'ltr' | 'rtl' | 'inherit';
}

export interface IImageWatermarkConfig extends IGeneralWatermarkConfig {
    url: string;
    width: number;
    height: number;
    maintainAspectRatio: boolean;
    originRatio: number;
}

export interface IUserInfoWatermarkConfig extends IGeneralWatermarkConfig, Omit<ITextWatermarkConfig, 'content'> {
    name: boolean;
    email: boolean;
    phone: boolean;
    uid: boolean;
}

export interface IWatermarkConfig {
    text?: ITextWatermarkConfig;
    image?: IImageWatermarkConfig;
    userInfo?: IUserInfoWatermarkConfig;
}

export interface IWatermarkConfigWithType {
    config: IWatermarkConfig;
    type: IWatermarkTypeEnum;
}
