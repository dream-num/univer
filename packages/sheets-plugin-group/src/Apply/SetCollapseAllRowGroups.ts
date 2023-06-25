import { GroupOpenType, StructGroup } from '../../Module/Group';

/**
 *
 * @param structGroup
 * @param openType
 *
 * @internal
 */
export function SetCollapseAllRowGroups(structGroup: StructGroup, openType: GroupOpenType) {
    structGroup.setAllGroupOpenType(openType);
}
