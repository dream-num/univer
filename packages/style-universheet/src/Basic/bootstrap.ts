import { IOCContainer } from '@univer/core';
import { StyleUniver } from '../StyleUniver';

export function Bootstrap(IOC: IOCContainer) {
    IOC.addMapping('StyleUniver', StyleUniver);
}
