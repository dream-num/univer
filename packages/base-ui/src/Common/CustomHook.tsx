import { useEffect, useRef, useState } from 'react';

/**
 *
 * custom click and dbclick hook
 *
 * Reference: https://stackoverflow.com/a/63891352
 * @param actionSimpleClick
 * @param actionDoubleClick
 * @param delay
 * @returns
 */
export function useSingleAndDoubleClick(actionSimpleClick: Function, actionDoubleClick: Function, delay = 250) {
    const [click, setClick] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            // simple click
            if (click === 1) actionSimpleClick();
            setClick(0);
        }, delay);

        // the duration between this click and the previous one
        // is less than the value of delay = double-click
        if (click === 2) actionDoubleClick();

        return () => clearTimeout(timer);
    }, [click]);

    return () => setClick((prev) => prev + 1);
}

/**
 * click outside
 * @returns
 */
export const useOutsideClick = () => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef();

    const handleOutsideClick = () => {
        if (!ref.current) {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return [ref, isVisible, setIsVisible];
};
