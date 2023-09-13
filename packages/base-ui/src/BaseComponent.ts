import { Context } from '@univerjs/core/src/Basics/Context';

// TODO Button const enum; BaseComponentSheet => BaseComponentXXX

export interface BaseComponentProps {
    getComponent?: (ref: any) => void; //获取自身组件
    id?: string; // 组件id

    /** @deprecated */
    context?: Context;
}
