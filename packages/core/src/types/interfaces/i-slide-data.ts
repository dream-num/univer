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

import type { ISize } from '../../shared/shape';
import type { IKeyType, Nullable } from '../../shared/types';
import type { IWorksheetData } from '../../sheets/typedef';
import type { LocaleType, ThemeColorType } from '../enum';
import type { ShapeType } from '../enum/prst-geom-type';
import type { ICustomBlock, IDocumentData, ILists } from './i-document-data';
import type { ITransformState } from './i-drawing';
import type { IImageProperties } from './i-image-properties';
import type { IPlaceholder } from './i-placeholder';
import type { IShapeProperties } from './i-shape-properties';
import type { IColorStyle, IStyleBase, IStyleData } from './i-style-data';

export interface ISlideData extends IReferenceSource {
    id: string; // unit id
    locale?: LocaleType;
    title: string;
    pageSize: ISize;
    body?: ISlidePageBody;
}

interface IReferenceSource {
    master?: { [id: string]: ISlidePage };
    handoutMaster?: { [id: string]: ISlidePage };
    notesMaster?: { [id: string]: ISlidePage };
    layouts?: { [id: string]: ISlidePage };
    lists?: ILists;
}

interface ISlidePageBody {
    pages: { [id: string]: ISlidePage };
    pageOrder: string[];
}

export interface ISlidePage {
    id: string;
    pageType: PageType;
    zIndex: number;
    title: string;
    description: string;
    pageBackgroundFill: IColorStyle;
    colorScheme?: ThemeColorType;
    pageElements: { [elementId: string]: IPageElement };
    // Union field properties. Properties that are specific for each page type. Masters do not require any additional properties. properties can be only one of the following:
    slideProperties?: ISlideProperties;
    layoutProperties?: ILayoutProperties;
    notesProperties?: INotesProperties;
    handoutProperties?: IHandoutProperties;
    masterProperties?: IMasterProperties;
}

interface ISlideProperties {
    layoutObjectId: string;
    masterObjectId: string;
    isSkipped: boolean;
}

interface ILayoutProperties {
    masterObjectId: string;
    name: string;
}

interface INotesProperties {
    name: string;
}

interface IHandoutProperties {
    name: string;
}

interface IMasterProperties {
    name: string;
}

export interface ISlideRichTextProps extends ITransformState, IStyleBase {
    text?: string;
    rich?: IDocumentData;
}

export interface IPageElement {
    id: string;
    zIndex: number;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    angle?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
    flipX?: boolean;
    flipY?: boolean;

    title: string;
    description: string;

    type: PageElementType;

    // Union field element_kind can be only one of the following:
    // elementGroup: IGroup;
    shape?: IShape;
    image?: IImage;
    richText?: ISlideRichTextProps;

    /** @deprecated */
    spreadsheet?: {
        worksheet: IWorksheetData;
        styles: IKeyType<Nullable<IStyleData>>;
    };
    /** @deprecated */
    document?: IDocumentData;
    /** @deprecated */
    slide?: ISlideData;
    // video: IVideo;
    // line: ILine;
    // table: ITable;
    // chart: IChartProperties;
    customBlock?: ICustomBlock; // customBlock 用户通过插件自定义的block
}

export enum PageType {
    SLIDE, // A slide page.
    MASTER, // A master slide page.
    LAYOUT, // A layout page.
    HANDOUT_MASTER, // A handout master page.
    NOTES_MASTER, // A notes master page.
}

export enum PageElementType {
    SHAPE,
    IMAGE,
    TEXT,
    SPREADSHEET,
    DOCUMENT,
    SLIDE,
}

/**
 * IShape
 */
export interface IShape {
    shapeType: ShapeType;
    text: string;
    shapeProperties: IShapeProperties;
    placeholder?: IPlaceholder;
    link?: ILink;
}

export interface IImage {
    imageProperties?: IImageProperties;
    placeholder?: IPlaceholder;
    link?: ILink;
}

interface ILink {
    relativeLink: RelativeSlideLink;
    pageId?: string;
    slideIndex?: number;
}

export enum RelativeSlideLink {
    RELATIVE_SLIDE_LINK_UNSPECIFIED, // An unspecified relative slide link.
    NEXT_SLIDE, // A link to the next slide.
    PREVIOUS_SLIDE, // A link to the previous slide.
    FIRST_SLIDE, // A link to the first slide in the presentation.
    LAST_SLIDE, // A link to the last slide in the presentation.
}
