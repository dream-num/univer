export enum ISlotElement {
    /**
     * JSX.Element，直接渲染组件
     */
    JSX = 'jsx',

    /**
     * string , JSX 组件名称，如fillColor 表明是一个fill color图标，通过这个组件名称直接生成字符串
     */
    JSX_STRING = 'jsx_string',

    /**
     * HTMLElement， HTML 元素
     */
    HTML = 'html',

    /**
     * string, HTML 字符串，直接渲染为 HTML内容
     */

    HTML_STRING = 'html_string',

    /**
     * String， 非HTML 字符串，直接渲染内容
     */
    STRING = 'string',

    SINGLE = 'single',
    SELECT = 'select',
}

export type ISlotElementType = `${ISlotElement}`;
