import { JSX } from 'preact';
import { ISlotElementType } from '../Enum';

export interface ISlotProps {
    /**
     * plugin name
     */
    name: string;
    /**
     * plugin type
     */
    type: ISlotElementType; // input doube
    /**
     * 支持
     * 1. JSX.Element，直接渲染组件
     * 2. HTML 元素
     * 3. HTML 字符串，直接渲染为HTML
     * 4. 非HTML 字符串，直接渲染内容
     */
    label: JSX.Element | HTMLElement | string;
}

export interface ISiderState extends ISlotProps {
    /**
     * show or hide
     */
    show: boolean;

    /**
     * Adjust the z-index according to the order shown
     */
    zIndex: number;
}
