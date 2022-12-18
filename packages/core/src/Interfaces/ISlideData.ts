import { LocaleType, ThemeColorType } from '../Enum';
import { ShapeType } from '../Enum/ShapeType';
import { IKeyType, Nullable } from '../Shared/Types';
import { ICustomBlock, IDocumentData, ILists, ISizeData } from './IDocumentData';
import { IImageProperties } from './IImageProperties';
import { IPlaceholder } from './IPlaceholder';
import { IShapeProperties } from './IShapeProperties';
import { IColorStyle, IStyleBase, IStyleData } from './IStyleData';
import { IWorksheetConfig } from './IWorksheetData';

export interface ISize {
    width?: number;
    height?: number;
}

export interface IScale {
    scaleX?: number;
    scaleY?: number;
}

export interface IOffset {
    left?: number;
    top?: number;
}

export interface ITransformState extends IOffset, ISize, IScale {
    angle?: number;
    skewX?: number;
    skewY?: number;
    flipX?: boolean;
    flipY?: boolean;
}

export interface ISlideData extends IReferenceSource {
    id: string; // unit id
    locale?: LocaleType;
    title: string;
    pageSize: ISizeData;
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

export interface IRichTextProps extends ITransformState, IStyleBase {
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
    richText?: IRichTextProps;
    spreadsheet?: {
        worksheet: IWorksheetConfig;
        styles: IKeyType<Nullable<IStyleData>>;
    };
    document?: IDocumentData;
    // video: IVideo;
    // line: ILine;
    // table: ITable;
    // chart: IChartProperties;
    customBlock?: ICustomBlock; // customBlock 用户通过插件自定义的block
}

export enum PageType {
    SLIDE, //	A slide page.
    MASTER, //	A master slide page.
    LAYOUT, //	A layout page.
    HANDOUT_MASTER, //	A handout master page.
    NOTES_MASTER, //	A notes master page.
}

export enum PageElementType {
    SHAPE,
    IMAGE,
    TEXT,
    SPREADSHEET,
    DOCUMENT,
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
    RELATIVE_SLIDE_LINK_UNSPECIFIED, //	An unspecified relative slide link.
    NEXT_SLIDE, //	A link to the next slide.
    PREVIOUS_SLIDE, //	A link to the previous slide.
    FIRST_SLIDE, //	A link to the first slide in the presentation.
    LAST_SLIDE, //	A link to the last slide in the presentation.
}
