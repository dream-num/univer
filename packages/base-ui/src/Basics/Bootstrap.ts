import { IOCContainer } from '@univerjs/core';
import { StyleUniver } from '@univerjs/style-univer/src/StyleUniver';

export function Bootstrap(IOC: IOCContainer) {
    IOC.addMapping('StyleUniver', StyleUniver);
}
