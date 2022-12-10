import { LocaleType, ThemeColorType } from '../Enum';
import { ICustomBlock, ILists, ISizeData } from './IDocumentData';
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
    // shape: IShapeProperties;
    // image: IImageProperties;
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
