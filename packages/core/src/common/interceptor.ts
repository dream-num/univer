import type { Nullable } from './type-utils';

export type InterceptorHandler<M = unknown, C = unknown> = (
    value: Nullable<M>,
    context: C,
    next: (value: Nullable<M>) => Nullable<M>
) => Nullable<M>;

export interface IInterceptor<M, C> {
    priority?: number;
    handler: InterceptorHandler<M, C>;
}

export const createInterceptorKey = <T = any, C = any>(key: string) => {
    const symbol = `sheet_interceptor_${key}`;
    return symbol as unknown as IInterceptor<T, C>;
};

/**
 * A helper to compose a certain type of interceptors.
 */
export function composeInterceptors<T = any, C = any>(interceptors: Array<IInterceptor<T, C>>) {
    // eslint-disable-next-line func-names
    return function (
        initialValue: Parameters<IInterceptor<T, C>['handler']>[0],
        context: Parameters<IInterceptor<T, C>['handler']>[1]
    ) {
        let index = -1;

        function passThrough(
            i: number,
            v: Parameters<IInterceptor<T, C>['handler']>[0]
        ): Parameters<IInterceptor<T, C>['handler']>[0] {
            if (i <= index) {
                throw new Error('[SheetInterceptorService]: next() called multiple times!');
            }

            index = i;
            if (i === interceptors.length) {
                return v;
            }

            const interceptor = interceptors[i];

            return interceptor.handler!(v, context, passThrough.bind(null, i + 1));
        }

        return passThrough(0, initialValue);
    };
}
