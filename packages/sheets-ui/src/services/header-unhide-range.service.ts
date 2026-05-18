import type { IDisposable, IRange, Workbook, Worksheet } from '@univerjs/core';

export interface IHeaderUnhideRangeVisibleCheck {
    axis: 'row' | 'column';
    range: IRange;
    workbook: Workbook;
    worksheet: Worksheet;
}

export type HeaderUnhideRangeVisibleHandler = (
    visible: boolean,
    payload: IHeaderUnhideRangeVisibleCheck
) => boolean;

export class HeaderUnhideRangeService {
    private readonly _visibleHandlers = new Set<HeaderUnhideRangeVisibleHandler>();

    registerRangeVisibleHandler(handler: HeaderUnhideRangeVisibleHandler): IDisposable {
        this._visibleHandlers.add(handler);
        const dispose = () => this._visibleHandlers.delete(handler);

        return {
            dispose,
            unsubscribe: dispose,
        } as IDisposable;
    }

    shouldRenderRange(visible: boolean, payload: IHeaderUnhideRangeVisibleCheck): boolean {
        let nextVisible = visible;
        for (const handler of this._visibleHandlers) {
            nextVisible = handler(nextVisible, payload);
        }

        return nextVisible;
    }
}
