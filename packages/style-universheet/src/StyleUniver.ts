import {
    BaseComponent,
    BaseComponentFactory,
    BaseComponentRender,
    BaseComponentSheet,
    ClassComponent,
    Description,
    ForwardFnComponent,
    FunctionComponent,
    PropsFrom,
} from '@univer/base-component';
import { Context, IOCContainer, Plugin } from '@univer/core';
// import { UniverSingleButton } from './Components';
import { UniverButton } from './Components/Button/Button';
import { UniverBorderDashDot } from './Components/CanvasIcon/BorderLine/BorderDashDot';
import { UniverBorderDashDotDot } from './Components/CanvasIcon/BorderLine/BorderDashDotDot';
import { UniverBorderDashed } from './Components/CanvasIcon/BorderLine/BorderDashed';
import { UniverBorderDotted } from './Components/CanvasIcon/BorderLine/BorderDotted';
import { UniverBorderHair } from './Components/CanvasIcon/BorderLine/BorderHair';
import { UniverBorderMedium } from './Components/CanvasIcon/BorderLine/BorderMedium';
import { UniverBorderMediumDashDot } from './Components/CanvasIcon/BorderLine/BorderMediumDashDot';
import { UniverBorderMediumDashDotDot } from './Components/CanvasIcon/BorderLine/BorderMediumDashDotDot';
import { UniverBorderMediumDashed } from './Components/CanvasIcon/BorderLine/BorderMediumDashed';
import { UniverBorderThick } from './Components/CanvasIcon/BorderLine/BorderThick';
import { UniverBorderThin } from './Components/CanvasIcon/BorderLine/BorderThin';
import { UniverCellRangeModal } from './Components/CellRangeModal';
import { UniverCheckbox } from './Components/Checkbox/Checkbox';
import { UniverCheckboxGroup } from './Components/Checkbox/Group';
import { UniverCollapse, UniverPanel } from './Components/Collapse/Collapse';
import { UniverColorPicker } from './Components/ColorPicker';
import { UniverColorPickerCircleButton } from './Components/ColorPickerCircleButton';
import { UniverContainer } from './Components/Container';
// import { UniverDemo } from './Components/Demo';
import { UniverFormatModal } from './Components/FormatModal';
import { UniverMenu } from './Components/Menu/Menu';
import {
    UniverBottomBorderIcon,
    UniverFillColorIcon,
    UniverFullBorderIcon,
    UniverInnerBorderIcon,
    UniverLeftBorderIcon,
    UniverMergeIcon,
    UniverNoneBorderIcon,
    UniverOuterBorderIcon,
    UniverRightBorderIcon,
    UniverStripingBorderIcon,
    UniverTopBorderIcon,
    UniverVerticalBorderIcon,
} from './Components/Icon/Cell';
import {
    UniverCheckIcon,
    UniverCleanIcon,
    UniverFilterIcon,
    UniverFilterRankIcon,
    UniverOrderASCIcon,
    UniverOrderDESCIcon,
    UniverOrderIcon,
    UniverPivotableIcon,
    UniverSumIcon,
} from './Components/Icon/Data';
import { UniverDeleteIcon } from './Components/Icon/Delete';
import { UniverBoldIcon, UniverDeleteLineIcon, UniverItalicIcon, UniverTextColorIcon, UniverUnderLineIcon } from './Components/Icon/Font';
import {
    UniverBackIcon,
    UniverCloseIcon,
    UniverDropDownIcon,
    UniverCorrectIcon,
    UniverFormatIcon,
    UniverForwardIcon,
    UniverHideIcon,
    UniverLtIcon,
    UniverMenuIcon,
    UniverNextIcon,
    UniverRightIcon,
} from './Components/Icon/Format';
import { UniverChartIcon, UniverLinkIcon, UniverPhotoIcon } from './Components/Icon/Insert';
import { UniverLoadingIcon } from './Components/Icon/Loading';
import { UniverLogoIcon } from './Components/Icon/Logo';
import { UniverAddIcon, UniverAddNumIcon, UniverFxIcon, UniverMoneyIcon, UniverPercentIcon, UniverReduceIcon, UniverReduceNumIcon } from './Components/Icon/Math';
import {
    UniverCommentIcon,
    UniverConditionalFormatIcon,
    UniverDivideIcon,
    UniverFreezeIcon,
    UniverLayoutIcon,
    UniverLocationIcon,
    UniverLockIcon,
    UniverPageIcon,
    UniverRegularIcon,
    UniverReplaceIcon,
    UniverSearchIcon,
    UniverTableIcon,
} from './Components/Icon/Sheet';
import {
    UniverLeftAlignIcon,
    UniverCenterAlignIcon,
    UniverRightAlignIcon,
    UniverTopVerticalIcon,
    UniverCenterVerticalIcon,
    UniverBottomVerticalIcon,
    UniverTextRotateIcon,
    UniverTextRotateAngleUpIcon,
    UniverTextRotateAngleDownIcon,
    UniverTextRotateVerticalIcon,
    UniverTextRotateRotationUpIcon,
    UniverTextRotateRotationDownIcon,
    UniverBrIcon,
    UniverOverflowIcon,
    UniverCutIcon,
} from './Components/Icon/Text';
import { UniverScreenshotIcon, UniverImageIcon, UniverPrintAreaIcon, UniverPrintIcon, UniverPrintTitleIcon } from './Components/Icon/View';
import { UniverInput } from './Components/Input';
import { UniverContent, UniverFooter, UniverHeader, UniverLayout, UniverSider } from './Components/Layout';
import { UniverModal } from './Components/Modal';
import { UniverRadio, UniverRadioGroup } from './Components/Radio';
import { UniverRichText } from './Components/RichText/RichText';
import { UniverSelect } from './Components/SelectComponent';
import { UniverSiderModal } from './Components/SiderModal';
import { UniverSlider } from './Components/Slider';
import { UniverTab, UniverTabPane } from './Components/Tabs';
import { UniverTooltip } from './Components/Tooltip';
import { UniverUl } from './Components/Ul';
import { UniverDropdown } from './Components/Dropdown';

/**
 *
 * en:
 *  style-univer / style-google provides core API to change the theme, and re-initializes the current data directly internally
 *
 * zh:
 * style-univer / style-google 提供核心API改变主题，内部直接拿到现在数据重新初始化
 *
 */
export class UniverComponentSheet extends Plugin implements BaseComponentSheet {
    constructor() {
        super('ComponentSheet');
    }

    onMapping(container: IOCContainer): void {}

    onMounted(context: Context): void {}

    getComponentRender(): BaseComponentRender {
        return new UniverComponentRender(this.getComponentFactory());
    }

    getComponentFactory(): UniverComponentFactory {
        return new UniverComponentFactory();
    }
}

export class UniverComponentRender implements BaseComponentRender {
    protected _componentFactory: BaseComponentFactory;

    constructor(componentFactory: BaseComponentFactory) {
        this._componentFactory = componentFactory;
    }

    renderForwardFn<T extends keyof Description>(name: string): ForwardFnComponent<PropsFrom<Description[T]>> {
        return this._componentFactory.createComponent(name).render() as ForwardFnComponent<PropsFrom<Description[T]>>;
    }

    renderClass<T extends keyof Description>(name: string): ClassComponent<PropsFrom<Description[T]>> {
        return this._componentFactory.createComponent(name).render() as ClassComponent<PropsFrom<Description[T]>>;
    }

    renderFunction<T extends keyof Description>(name: T): FunctionComponent<PropsFrom<Description[T]>> {
        return this._componentFactory.createComponent(name).render() as FunctionComponent<PropsFrom<Description[T]>>;
    }
}

export class UniverComponentFactory implements BaseComponentFactory {
    createComponent<T extends BaseComponent>(name: string): T {
        switch (name) {
            case 'Button': {
                return new UniverButton() as unknown as T;
            }
            // case 'SingleButton': {
            //     return new UniverSingleButton() as unknown as T;
            // }
            case 'Select': {
                return new UniverSelect() as unknown as T;
            }
            case 'Container': {
                return new UniverContainer() as unknown as T;
            }
            case 'CellRangeModal': {
                return new UniverCellRangeModal() as unknown as T;
            }
            case 'Modal': {
                return new UniverModal() as unknown as T;
            }
            case 'SiderModal': {
                return new UniverSiderModal() as unknown as T;
            }
            case 'Layout': {
                return new UniverLayout() as unknown as T;
            }
            case 'Header': {
                return new UniverHeader() as unknown as T;
            }
            case 'Footer': {
                return new UniverFooter() as unknown as T;
            }
            case 'Content': {
                return new UniverContent() as unknown as T;
            }
            case 'Sider': {
                return new UniverSider() as unknown as T;
            }
            // case 'Demo': {
            //     return new UniverDemo() as unknown as T;
            // }
            case 'Checkbox': {
                return new UniverCheckbox() as unknown as T;
            }
            case 'CheckboxGroup': {
                return new UniverCheckboxGroup() as unknown as T;
            }
            case 'ColorPicker': {
                return new UniverColorPicker() as unknown as T;
            }
            case 'ColorPickerCircleButton': {
                return new UniverColorPickerCircleButton() as unknown as T;
            }
            case 'Input': {
                return new UniverInput() as unknown as T;
            }
            case 'Radio': {
                return new UniverRadio() as unknown as T;
            }
            case 'RadioGroup': {
                return new UniverRadioGroup() as unknown as T;
            }
            case 'Tab': {
                return new UniverTab() as unknown as T;
            }
            case 'TabPane': {
                return new UniverTabPane() as unknown as T;
            }
            case 'Tooltip': {
                return new UniverTooltip() as unknown as T;
            }
            case 'Ul': {
                return new UniverUl() as unknown as T;
            }
            case 'Collapse': {
                return new UniverCollapse() as unknown as T;
            }
            case 'Panel': {
                return new UniverPanel() as unknown as T;
            }
            case 'FormatModal': {
                return new UniverFormatModal() as unknown as T;
            }
            case 'RichText': {
                return new UniverRichText() as unknown as T;
            }
            case 'Menu': {
                return new UniverMenu() as unknown as T;
            }
            case 'Dropdown': {
                return new UniverDropdown() as unknown as T;
            }
            // Icon
            case 'NextIcon': {
                return new UniverNextIcon() as unknown as T;
            }
            case 'RightIcon': {
                return new UniverRightIcon() as unknown as T;
            }
            case 'OrderIcon': {
                return new UniverOrderIcon() as unknown as T;
            }
            case 'CommentIcon': {
                return new UniverCommentIcon() as unknown as T;
            }
            case 'ConditionalFormatIcon': {
                return new UniverConditionalFormatIcon() as unknown as T;
            }
            case 'ScreenshotIcon': {
                return new UniverScreenshotIcon() as unknown as T;
            }
            case 'CheckIcon': {
                return new UniverCheckIcon() as unknown as T;
            }
            case 'SearchIcon': {
                return new UniverSearchIcon() as unknown as T;
            }
            case 'ReplaceIcon': {
                return new UniverReplaceIcon() as unknown as T;
            }
            case 'FreezeIcon': {
                return new UniverFreezeIcon() as unknown as T;
            }
            case 'PivotableIcon': {
                return new UniverPivotableIcon() as unknown as T;
            }
            case 'FillColorIcon': {
                return new UniverFillColorIcon() as unknown as T;
            }
            case 'BoldIcon': {
                return new UniverBoldIcon() as unknown as T;
            }
            case 'FullBorderIcon': {
                return new UniverFullBorderIcon() as unknown as T;
            }
            case 'TopBorderIcon': {
                return new UniverTopBorderIcon() as unknown as T;
            }
            case 'BottomBorderIcon': {
                return new UniverBottomBorderIcon() as unknown as T;
            }
            case 'LeftBorderIcon': {
                return new UniverLeftBorderIcon() as unknown as T;
            }
            case 'RightBorderIcon': {
                return new UniverRightBorderIcon() as unknown as T;
            }
            case 'NoneBorderIcon': {
                return new UniverNoneBorderIcon() as unknown as T;
            }
            case 'OuterBorderIcon': {
                return new UniverOuterBorderIcon() as unknown as T;
            }
            case 'InnerBorderIcon': {
                return new UniverInnerBorderIcon() as unknown as T;
            }
            case 'StripingBorderIcon': {
                return new UniverStripingBorderIcon() as unknown as T;
            }
            case 'VerticalBorderIcon': {
                return new UniverVerticalBorderIcon() as unknown as T;
            }
            case 'MergeIcon': {
                return new UniverMergeIcon() as unknown as T;
            }
            case 'SumIcon': {
                return new UniverSumIcon() as unknown as T;
            }
            case 'OrderDESCIcon': {
                return new UniverOrderDESCIcon() as unknown as T;
            }
            case 'OrderASCIcon': {
                return new UniverOrderASCIcon() as unknown as T;
            }
            case 'FilterIcon': {
                return new UniverFilterIcon() as unknown as T;
            }
            case 'FilterRankIcon': {
                return new UniverFilterRankIcon() as unknown as T;
            }
            case 'CleanIcon': {
                return new UniverCleanIcon() as unknown as T;
            }
            case 'DeleteIcon': {
                return new UniverDeleteIcon() as unknown as T;
            }
            case 'DeleteLineIcon': {
                return new UniverDeleteLineIcon() as unknown as T;
            }
            case 'UnderLineIcon': {
                return new UniverUnderLineIcon() as unknown as T;
            }
            case 'ItalicIcon': {
                return new UniverItalicIcon() as unknown as T;
            }
            case 'TextColorIcon': {
                return new UniverTextColorIcon() as unknown as T;
            }
            case 'BackIcon': {
                return new UniverBackIcon() as unknown as T;
            }
            case 'ForwardIcon': {
                return new UniverForwardIcon() as unknown as T;
            }
            case 'FormatIcon': {
                return new UniverFormatIcon() as unknown as T;
            }
            case 'CorrectIcon': {
                return new UniverCorrectIcon() as unknown as T;
            }
            case 'LtIcon': {
                return new UniverLtIcon() as unknown as T;
            }
            case 'CloseIcon': {
                return new UniverCloseIcon() as unknown as T;
            }
            case 'DropDownIcon': {
                return new UniverDropDownIcon() as unknown as T;
            }
            case 'MenuIcon': {
                return new UniverMenuIcon() as unknown as T;
            }
            case 'HideIcon': {
                return new UniverHideIcon() as unknown as T;
            }
            case 'PhotoIcon': {
                return new UniverPhotoIcon() as unknown as T;
            }
            case 'LinkIcon': {
                return new UniverLinkIcon() as unknown as T;
            }
            case 'ChartIcon': {
                return new UniverChartIcon() as unknown as T;
            }
            case 'LoadingIcon': {
                return new UniverLoadingIcon() as unknown as T;
            }
            case 'LogoIcon': {
                return new UniverLogoIcon() as unknown as T;
            }
            case 'AddNumIcon': {
                return new UniverAddNumIcon() as unknown as T;
            }
            case 'ReduceNumIcon': {
                return new UniverReduceNumIcon() as unknown as T;
            }
            case 'PercentIcon': {
                return new UniverPercentIcon() as unknown as T;
            }
            case 'MoneyIcon': {
                return new UniverMoneyIcon() as unknown as T;
            }
            case 'FxIcon': {
                return new UniverFxIcon() as unknown as T;
            }
            case 'AddIcon': {
                return new UniverAddIcon() as unknown as T;
            }
            case 'ReduceIcon': {
                return new UniverReduceIcon() as unknown as T;
            }
            case 'DivideIcon': {
                return new UniverDivideIcon() as unknown as T;
            }
            case 'LockIcon': {
                return new UniverLockIcon() as unknown as T;
            }
            case 'LocationIcon': {
                return new UniverLocationIcon() as unknown as T;
            }
            case 'PageIcon': {
                return new UniverPageIcon() as unknown as T;
            }
            case 'RegularIcon': {
                return new UniverRegularIcon() as unknown as T;
            }
            case 'LayoutIcon': {
                return new UniverLayoutIcon() as unknown as T;
            }
            case 'TableIcon': {
                return new UniverTableIcon() as unknown as T;
            }
            case 'ImageIcon': {
                return new UniverImageIcon() as unknown as T;
            }
            case 'LeftAlignIcon': {
                return new UniverLeftAlignIcon() as unknown as T;
            }
            case 'CenterAlignIcon': {
                return new UniverCenterAlignIcon() as unknown as T;
            }
            case 'RightAlignIcon': {
                return new UniverRightAlignIcon() as unknown as T;
            }
            case 'TopVerticalIcon': {
                return new UniverTopVerticalIcon() as unknown as T;
            }
            case 'CenterVerticalIcon': {
                return new UniverCenterVerticalIcon() as unknown as T;
            }
            case 'BottomVerticalIcon': {
                return new UniverBottomVerticalIcon() as unknown as T;
            }
            case 'TextRotateIcon': {
                return new UniverTextRotateIcon() as unknown as T;
            }
            case 'TextRotateAngleUpIcon': {
                return new UniverTextRotateAngleUpIcon() as unknown as T;
            }
            case 'TextRotateAngleDownIcon': {
                return new UniverTextRotateAngleDownIcon() as unknown as T;
            }
            case 'TextRotateVerticalIcon': {
                return new UniverTextRotateVerticalIcon() as unknown as T;
            }
            case 'TextRotateRotationUpIcon': {
                return new UniverTextRotateRotationUpIcon() as unknown as T;
            }
            case 'TextRotateRotationDownIcon': {
                return new UniverTextRotateRotationDownIcon() as unknown as T;
            }
            case 'BrIcon': {
                return new UniverBrIcon() as unknown as T;
            }
            case 'OverflowIcon': {
                return new UniverOverflowIcon() as unknown as T;
            }
            case 'CutIcon': {
                return new UniverCutIcon() as unknown as T;
            }
            case 'PrintIcon': {
                return new UniverPrintIcon() as unknown as T;
            }
            case 'PrintAreaIcon': {
                return new UniverPrintAreaIcon() as unknown as T;
            }
            case 'PrintTitleIcon': {
                return new UniverPrintTitleIcon() as unknown as T;
            }
            case 'BorderDashDot': {
                return new UniverBorderDashDot() as unknown as T;
            }
            case 'BorderDashDotDot': {
                return new UniverBorderDashDotDot() as unknown as T;
            }
            case 'BorderDashed': {
                return new UniverBorderDashed() as unknown as T;
            }
            case 'BorderDotted': {
                return new UniverBorderDotted() as unknown as T;
            }
            case 'BorderHair': {
                return new UniverBorderHair() as unknown as T;
            }
            case 'BorderMedium': {
                return new UniverBorderMedium() as unknown as T;
            }
            case 'BorderMediumDashDot': {
                return new UniverBorderMediumDashDot() as unknown as T;
            }
            case 'BorderMediumDashDotDot': {
                return new UniverBorderMediumDashDotDot() as unknown as T;
            }
            case 'BorderMediumDashed': {
                return new UniverBorderMediumDashed() as unknown as T;
            }
            case 'BorderThick': {
                return new UniverBorderThick() as unknown as T;
            }
            case 'BorderThin': {
                return new UniverBorderThin() as unknown as T;
            }
            case 'Slider': {
                return new UniverSlider() as unknown as T;
            }
        }
        throw new Error('Not Found Component');
    }
}

// export class GoogleComponentSheet extends Plugin implements ComponentSheet {
//     constructor() {
//         super('ComponentSheet');
//     }
//     getComponentFactory(): GoogleComponentFactory {
//         return new GoogleComponentFactory();
//     }
//     onMapping(container: IOCContainer): void {}
//     onMounted(ctx: Context): void {}
// }
//
// export class GoogleComponentFactory implements ComponentFactory {
//     getComponent(name: string): BaseComponent {
//         switch (name) {
//             case 'button':
//                 return Button;
//                 break;
//             case 'Container':
//                 return Container;
//                 break;
//
//             default:
//                 break;
//         }
//     }
// }
