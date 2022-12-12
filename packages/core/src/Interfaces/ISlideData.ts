import { LocaleType, ThemeColorType } from '../Enum';
import { ShapeType } from '../Enum/ShapeType';
import { ICustomBlock, ILists, ISizeData } from './IDocumentData';
import { IImageProperties } from './IImageProperties';
import { IPlaceholder } from './IPlaceholder';
import { IShapeProperties } from './IShapeProperties';
import { IColorStyle } from './IStyleData';

export interface ISlideData extends IReferenceSource {
    id: string; // unit id
    locale?: LocaleType;
    title?: string;
    pageSize: ISizeData;
    body: ISlidePageBody;
}

interface IReferenceSource {
    master?: { [id: string]: ISlidePage };
    handoutMaster?: { [id: string]: ISlidePage };
    notesMaster?: { [id: string]: ISlidePage };
    layouts?: { [id: string]: ISlidePage };
    lists?: ILists;
}

interface ISlidePageBody {
    slides: { [id: string]: ISlidePage };
    slideOrder: string[];
}

export interface ISlidePage {
    id: string;
    pageType: PageType;
    title: string;
    description: string;
    pageBackgroundFill: IColorStyle;
    colorScheme?: ThemeColorType;
    pageElements: { [elementId: string]: IPageElement };
    pageElementOrder: string[];
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

export interface IPageElement {
    id: string;
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
    flipX: boolean;
    flipY: boolean;

    title: string;
    description: string;

    // Union field element_kind can be only one of the following:
    // elementGroup: IGroup;
    shape: IShape;
    image: IImage;
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

/**
 * IShape
 */
export interface IShape {
    shapeType: ShapeType;
    text: string;
    shapeProperties: IShapeProperties;
    placeholder: IPlaceholder;
    link: ILink;
}

export interface IImage {
    imageProperties?: IImageProperties;
    placeholder: IPlaceholder;
    link: ILink;
}

export interface ILink {
    url: string;
    relativeLink: RelativeSlideLink;
    pageObjectId: string;
    slideIndex: number;
}

export enum RelativeSlideLink {
    RELATIVE_SLIDE_LINK_UNSPECIFIED, //	An unspecified relative slide link.
    NEXT_SLIDE, //	A link to the next slide.
    PREVIOUS_SLIDE, //	A link to the previous slide.
    FIRST_SLIDE, //	A link to the first slide in the presentation.
    LAST_SLIDE, //	A link to the last slide in the presentation.
}
