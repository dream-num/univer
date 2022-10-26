import { FormatModalComponent } from './FormatModal';
import { AvatarComponent } from './Avatar';
import { CheckboxComponent, CheckboxGroupComponent } from './Checkbox';
import { ColorPickerCircleButtonComponent } from './ColorPickerCircleButton';
import { SiderModalComponent } from './SiderModal';
import { ButtonComponent, CellRangeModalComponent, DemoComponent } from '../BaseComponent';
import { IconComponent } from './Icon';
import { InputComponent } from './Input';
import { TabComponent, TabPaneComponent } from './Tab';
import { RadioComponent, RadioGroupComponent } from './Radio';
import { ContainerComponent, ContentComponent, FooterComponent, HeaderComponent, LayoutComponent, SiderComponent } from './Container';
import { SingleButtonComponent } from './SingleButton';
import { SelectComponent } from './Select';
import { ModalComponent } from './Modal';
import { ColorPickerComponent } from './ColorPicker';
import { TooltipComponent } from './Tooltip';
import { CollapseComponent, PanelComponent } from './Collapse';
import { UlComponent } from './Ul';
import { RichTextComponent } from './RichText';
import { SliderComponent } from './Slider';
import { MenuComponent } from './Menu';
import { DropdownComponent } from './Dropdown';

export interface Description {
    Button: ButtonComponent;
    SingleButton: SingleButtonComponent;
    Select: SelectComponent;
    Container: ContainerComponent;
    CellRangeModal: CellRangeModalComponent;
    Modal: ModalComponent;
    SiderModal: SiderModalComponent;
    Layout: LayoutComponent;
    Header: HeaderComponent;
    Slider: SliderComponent;
    Footer: FooterComponent;
    Content: ContentComponent;
    Sider: SiderComponent;
    Demo: DemoComponent;
    Checkbox: CheckboxComponent;
    CheckboxGroup: CheckboxGroupComponent;
    ColorPicker: ColorPickerComponent;
    ColorPickerCircleButton: ColorPickerCircleButtonComponent;
    Input: InputComponent;
    Radio: RadioComponent;
    RadioGroup: RadioGroupComponent;
    Tab: TabComponent;
    TabPane: TabPaneComponent;
    Avatar: AvatarComponent;
    Tooltip: TooltipComponent;
    Ul: UlComponent;
    Collapse: CollapseComponent;
    Panel: PanelComponent;
    FormatModal: FormatModalComponent;
    RichText: RichTextComponent;
    Menu: MenuComponent;
    Dropdown: DropdownComponent;

    // Icon
    NextIcon: IconComponent;
    RightIcon: IconComponent;
    OrderIcon: IconComponent;
    CommentIcon: IconComponent;
    ConditionalFormatIcon: IconComponent;
    ScreenshotIcon: IconComponent;
    CheckIcon: IconComponent;
    SearchIcon: IconComponent;
    ReplaceIcon: IconComponent;
    FreezeIcon: IconComponent;
    PivotableIcon: IconComponent;
    FillColorIcon: IconComponent;
    BoldIcon: IconComponent;
    FullBorderIcon: IconComponent;
    TopBorderIcon: IconComponent;
    BottomBorderIcon: IconComponent;
    LeftBorderIcon: IconComponent;
    RightBorderIcon: IconComponent;
    NoneBorderIcon: IconComponent;
    OuterBorderIcon: IconComponent;
    InnerBorderIcon: IconComponent;
    StripingBorderIcon: IconComponent;
    VerticalBorderIcon: IconComponent;
    MergeIcon: IconComponent;
    SumIcon: IconComponent;
    OrderDESCIcon: IconComponent;
    OrderASCIcon: IconComponent;
    FilterIcon: IconComponent;
    FilterRankIcon: IconComponent;
    CleanIcon: IconComponent;
    DeleteIcon: IconComponent;
    DeleteLineIcon: IconComponent;
    UnderLineIcon: IconComponent;
    ItalicIcon: IconComponent;
    TextColorIcon: IconComponent;
    BackIcon: IconComponent;
    ForwardIcon: IconComponent;
    FormatIcon: IconComponent;
    CorrectIcon: IconComponent;
    LtIcon: IconComponent;
    CloseIcon: IconComponent;
    DropDownIcon: IconComponent;
    MenuIcon: IconComponent;
    HideIcon: IconComponent;
    PhotoIcon: IconComponent;
    LinkIcon: IconComponent;
    ChartIcon: IconComponent;
    LoadingIcon: IconComponent;
    LogoIcon: IconComponent;
    AddNumIcon: IconComponent;
    ReduceNumIcon: IconComponent;
    PercentIcon: IconComponent;
    MoneyIcon: IconComponent;
    FxIcon: IconComponent;
    AddIcon: IconComponent;
    ReduceIcon: IconComponent;
    DivideIcon: IconComponent;
    LockIcon: IconComponent;
    LocationIcon: IconComponent;
    PageIcon: IconComponent;
    RegularIcon: IconComponent;
    LayoutIcon: IconComponent;
    TableIcon: IconComponent;
    ImageIcon: IconComponent;
    LeftAlignIcon: IconComponent;
    CenterAlignIcon: IconComponent;
    RightAlignIcon: IconComponent;
    TopVerticalIcon: IconComponent;
    CenterVerticalIcon: IconComponent;
    BottomVerticalIcon: IconComponent;
    TextRotateIcon: IconComponent;
    TextRotateAngleUpIcon: IconComponent;
    TextRotateAngleDownIcon: IconComponent;
    TextRotateVerticalIcon: IconComponent;
    TextRotateRotationUpIcon: IconComponent;
    TextRotateRotationDownIcon: IconComponent;
    BrIcon: IconComponent;
    OverflowIcon: IconComponent;
    CutIcon: IconComponent;

    PrintIcon: IconComponent;
    PrintAreaIcon: IconComponent;
    PrintTitleIcon: IconComponent;

    BorderDashDot: IconComponent;
    BorderDashDotDot: IconComponent;
    BorderDashed: IconComponent;
    BorderDotted: IconComponent;
    BorderHair: IconComponent;
    BorderMedium: IconComponent;
    BorderMediumDashDot: IconComponent;
    BorderMediumDashDotDot: IconComponent;
    BorderMediumDashed: IconComponent;
    BorderThick: IconComponent;
    BorderThin: IconComponent;
}

export enum DescriptionEnum {
    Button,
    SingleButton,
    Select,
    Container,
    CellRangeModal,
    Modal,
    SiderModal,
    Layout,
    Header,
    Footer,
    Content,
    Sider,
    Demo,
    Checkbox,
    CheckboxGroup,
    ColorPicker,
    ColorPickerCircleButton,
    Input,
    Radio,
    RadioGroup,
    Tab,
    TabPane,
    Avatar,
    Tooltip,
    Ul,
    Collapse,
    Panel,
    FormatModal,
    RichText,

    // Icon
    NextIcon,
    RightIcon,
    OrderIcon,
    CommentIcon,
    ConditionalFormatIcon,
    ScreenshotIcon,
    CheckIcon,
    SearchIcon,
    ReplaceIcon,
    FreezeIcon,
    PivotableIcon,
    FillColorIcon,
    BoldIcon,
    FullBorderIcon,
    TopBorderIcon,
    BottomBorderIcon,
    LeftBorderIcon,
    RightBorderIcon,
    NoneBorderIcon,
    OuterBorderIcon,
    InnerBorderIcon,
    StripingBorderIcon,
    VerticalBorderIcon,
    MergeIcon,
    SumIcon,
    OrderDESCIcon,
    OrderASCIcon,
    FilterIcon,
    FilterRankIcon,
    CleanIcon,
    DeleteIcon,
    DeleteLineIcon,
    UnderLineIcon,
    ItalicIcon,
    TextColorIcon,
    BackIcon,
    ForwardIcon,
    FormatIcon,
    CorrectIcon,
    LtIcon,
    CloseIcon,
    DropDownIcon,
    MenuIcon,
    HideIcon,
    PhotoIcon,
    LinkIcon,
    ChartIcon,
    LoadingIcon,
    LogoIcon,
    AddNumIcon,
    ReduceNumIcon,
    PercentIcon,
    MoneyIcon,
    FxIcon,
    AddIcon,
    ReduceIcon,
    DivideIcon,
    LockIcon,
    LocationIcon,
    PageIcon,
    RegularIcon,
    LayoutIcon,
    TableIcon,
    ImageIcon,
    LeftAlignIcon,
    CenterAlignIcon,
    RightAlignIcon,
    TopVerticalIcon,
    CenterVerticalIcon,
    BottomVerticalIcon,
    TextRotateIcon,
    TextRotateAngleUpIcon,
    TextRotateAngleDownIcon,
    TextRotateVerticalIcon,
    TextRotateRotationUpIcon,
    TextRotateRotationDownIcon,
    BrIcon,
    OverflowIcon,
    CutIcon,

    PrintIcon,
    PrintAreaIcon,
    PrintTitleIcon,

    BorderDashDot,
    BorderDashDotDot,
    BorderDashed,
    BorderDotted,
    BorderHair,
    BorderMedium,
    BorderMediumDashDot,
    BorderMediumDashDotDot,
    BorderMediumDashed,
    BorderThick,
    BorderThin,
}
