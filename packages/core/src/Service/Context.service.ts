import { createIdentifier } from '@wendellhu/redi';

import { Context } from '../Basics/Context';

/**
 * Global context object
 *
 * @deprecated global context should be broken into smaller pieces. This service is created
 * as a temporary solution to get the application running.
 */
export const IGlobalContext = createIdentifier<Context>('univer.global-context');
