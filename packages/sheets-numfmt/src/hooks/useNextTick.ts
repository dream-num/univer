import { useEffect, useRef, useState } from 'react';

export const useNextTick = () => {
    const effectList = useRef<Array<() => void>>([]);
    const [value, dispatch] = useState<Record<string, string>>({});

    useEffect(() => {
        effectList.current.forEach((fn) => {
            fn();
        });
        effectList.current = [];
    }, [value]);

    const nextTick = (fn: () => void) => {
        effectList.current.push(fn);
        dispatch({});
    };
    return nextTick;
};
