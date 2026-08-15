import { borderClassName, clsx } from '@univerjs/design';

export const RangeLoading = () => {
    return (
        <div
            className={clsx(`
              univer-flex univer-size-full univer-origin-top-left univer-items-center univer-justify-center
              univer-bg-gray-0
              dark:!univer-bg-gray-900
            `, borderClassName)}
        >
            Loading...
        </div>
    );
};
