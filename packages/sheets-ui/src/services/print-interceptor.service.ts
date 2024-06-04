import { Disposable, IRange, InterceptorManager, createInterceptorKey } from "@univerjs/core";
import { Scene } from "@univerjs/engine-render";

interface ISheetPos {
    unitId: string;
    subUnitId: string;
}

const PRINTING_RANGE = createInterceptorKey<IRange, ISheetPos>('PRINTING_RANGE');
const PRINTING_COMPONENT_COLLECT = createInterceptorKey<undefined, ISheetPos & { scene: Scene }>('PRINTING_COMPONENT_COLLECT');

export class SheetPrintInterceptorService extends Disposable {
    interceptor = new InterceptorManager({
        PRINTING_RANGE,
        PRINTING_COMPONENT_COLLECT,
    });

    constructor() {
        super();
        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_RANGE, {
            priority: -1,
            handler: (_value) => _value,
        }));

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT, {
            priority: -1,
            handler: (_value) => _value,
        }));
    }
}
