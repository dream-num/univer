import { ISlotElementType } from '@univer/base-component';
import { JSX } from 'preact';

export interface IMainProps {
    /**
     * plugin name
     */
    name: string;
    /**
     * plugin type
     */
    type: ISlotElementType;
    /**
     * 支持
     * 1. JSX.Element，直接渲染组件
     * 2. HTML 元素
     * 3. HTML 字符串，直接渲染为HTML
     * 4. 非HTML 字符串，直接渲染内容
     */
    content: JSX.Element | HTMLElement | string;

    show?: boolean;
}

export interface IMainState extends IMainProps {
    /**
     * show or hide
     */
    show: boolean;

    /**
     * Adjust the z-index according to the order shown
     */
    zIndex: number;
}
