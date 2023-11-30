import { useEffect, useReducer, useRef } from 'react';

export const useNextTick = () => {
    const effectList = useRef<Array<() => void>>([]);
    const [_, dispatch] = useReducer(() => ({}), {});

    useEffect(() => {
        effectList.current.forEach((fn) => {
            fn();
        });
        effectList.current = [];
    });

    const nextTick = (fn: () => void) => {
        effectList.current.push(fn);
        dispatch();
    };
    return nextTick;
};
