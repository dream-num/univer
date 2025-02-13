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

export enum DOCS_VIEW_KEY {
    MAIN = '__Document_Render_Main__',
    BACKGROUND = '__Document_Render_Background__',
}

export enum VIEWPORT_KEY {
    VIEW_MAIN = 'viewMain',
    VIEW_TOP = 'viewTop',
    VIEW_LEFT = 'viewLeft',
    VIEW_LEFT_TOP = 'viewLeftTop',
}

export const DOCS_COMPONENT_BACKGROUND_LAYER_INDEX = 0;

export const DOCS_COMPONENT_MAIN_LAYER_INDEX = 2;

export const DOCS_COMPONENT_HEADER_LAYER_INDEX = 4;

export const DOCS_COMPONENT_DEFAULT_Z_INDEX = 10;

export const NORMAL_TEXT_SELECTION_PLUGIN_NAME = 'normalTextSelectionPluginName';
