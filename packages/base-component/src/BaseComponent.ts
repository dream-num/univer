import { BasePlugin } from '@univer/core';
import { ISelectButtonType } from './Enum/ISelectButton';
import { ISlotElementType } from './Enum/ISlotElement';
import { ComponentClass, ForwardFn, RefObject } from './Framework';
import { IMainProps } from './IData';
import { BaseIconProps, Description } from './Components';

// TODO Button const enum

// UniverSheet base component
export interface BaseComponentSheet extends BasePlugin {
    getComponentRender(): BaseComponentRender;
    getComponentFactory(): BaseComponentFactory;
}
export interface BaseComponentProps {}

export interface BaseComponent<T = any> {
    render(): JSXComponent<T>;
}
export interface BaseComponentFactory {
    createComponent<T extends BaseComponent>(name: string): T;
}
export interface BaseComponentRender {
    renderForwardFn<T extends keyof Description>(name: string): ForwardFnComponent<PropsFrom<Description[T]>>;
    renderClass<T extends keyof Description>(name: string): ClassComponent<PropsFrom<Description[T]>>;
    renderFunction<T extends keyof Description>(name: T): FunctionComponent<PropsFrom<Description[T]>>;
}

// Components interface
const ButtonTypes: string[] = ['default', 'primary'];
export type ButtonType = typeof ButtonTypes[number];
const ButtonShapes: string[] = ['circle', 'round'];
export type ButtonShape = typeof ButtonShapes[number];
const SizeTypes: string[] = ['small', 'middle', 'large'];
export type SizeType = typeof SizeTypes[number];
const ButtonHTMLTypes: string[] = ['submit', 'rest', 'button'];
export type ButtonHTMLType = typeof ButtonHTMLTypes[number];

export interface BaseButtonProps extends BaseComponentProps {
    type?: ButtonType;
    shape?: ButtonShape;
    size?: SizeType;
    danger?: boolean;
    disabled?: boolean;
    block?: boolean;
    loading?: boolean;
    active?: boolean;
    htmlType?: ButtonHTMLType;
    onClick?: Function;
    children?: any;
    className?: string;
    style?: JSX.CSSProperties;
}
export interface BaseCellRangeModalProps extends BaseComponentProps {
    placeholderProps?: string;
    valueProps?: string;
}
export interface BaseDemoProps extends BaseComponentProps {
    onClick?: (e: MouseEvent) => void;
}
export interface IToolBarItemProps extends BaseComponentProps {
    /**
     * locale info
     */
    locale?: string;
    /**
     * icon locale info
     */
    iconName?: string;
    /**
     * show info
     */
    label?: string | JSX.Element;
    /**
     * value
     */
    value?: string | number;

    /**
     * is selected
     */
    selected?: boolean;
    /**
     * icon
     */
    icon?: JSX.Element | string | null | undefined;

    /**
     * icon props for the icon represented by the string
     */
    iconProps?: BaseIconProps;

    /**
     * type of item
     */
    type?: ISlotElementType;

    /**
     * tooltip info
     */
    tooltip?: string;

    /**
     *
     */
    tooltipRight?: string;

    /**
     * top split line
     */
    border?: boolean;

    /**
     * is show
     */
    show?: boolean;

    /**
     * child item
     */
    children?: IToolBarItemProps[];

    /**
     * click event listener
     */
    onClick?: (...arg: any[]) => void;

    /**
     * key up event listener
     */
    onKeyUp?: (...arg: any[]) => void;

    /**
     * trigger update label
     */
    triggerUpdate?: (func: Function) => void;

    /**
     * style
     */
    style?: Record<string, string>;

    /**
     * apply to input box
     */
    needChange?: boolean;

    /**
     * type of select element
     */
    selectType?: ISelectButtonType;

    // TODO: what is meaning
    slot?: {
        header?: IMainProps;
        footer?: IMainProps;
    };
}

export interface BaseToolBarProps extends BaseComponentProps {
    style?: JSX.CSSProperties;
    toolList: IToolBarItemProps[];
    forwardRefs?: RefObject<HTMLElement>;
    func?: {
        addButton: Function;
    };
}

// component class
export interface ButtonComponent extends BaseComponent<BaseButtonProps> {
    render(): JSXComponent<BaseButtonProps>;
}
export interface CellRangeModalComponent extends BaseComponent<BaseCellRangeModalProps> {
    render(): JSXComponent<BaseCellRangeModalProps>;
}
export interface DemoComponent extends BaseComponent<BaseDemoProps> {
    render(): JSXComponent<BaseDemoProps>;
}

// export interface SheetContainerComponent extends BaseComponent<BaseSheetContainerProps> {
//     render(): JSXComponent<BaseSheetContainerProps>;
// }
export interface ToolBarComponent extends BaseComponent<BaseToolBarProps> {
    render(): JSXComponent<BaseToolBarProps>;
}

// component type
export type PropsFrom<T> = T extends BaseComponent<infer Props> ? Props : void;
export type FunctionComponent<T = void> = (props: T) => JSX.Element;
export type ClassComponent<T = any, E = any> = ComponentClass<T, E>;
export type ForwardFnComponent<T> = ForwardFn<T>;
export type JSXComponent<T = void> = FunctionComponent<T> | ForwardFnComponent<T> | ClassComponent<T>;
