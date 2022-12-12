/* ==========================================================================
    Macro:         Hunter's Mark
    Source:        MidiQOL Examples
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Hunter's Mark",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    hitTargets: lastArg.hitTargets,
    isCritical: lastArg.isCritical || false,
    itemData:   lastArg.item,
    itemID:     lastArg.itemUuid,
    spellLevel: lastArg.spellLevel,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.hitTargets.length === 0) {
    return false;
}


// Handle Bonus Damage --------------------------------------------------------
if (props.state === "DamageBonus") {

    if (props.actorData?.flags?.dae?.onUpdateTarget) {
        const isMarked = props.actorData.flags.dae.onUpdateTarget.find((flag) => {
            console.warn(flag);
            return flag.flagName === "Hunter's Mark" && flag.sourceTokenUuid === props.lastArg.hitTargetUuids[0];
        });

        console.warn(props.actorData, isMarked);

        if (!isMarked) {
            return false;
        }

        const [[, damageType]] = props.itemData.system.damage.parts;
        const diceMulti = props.isCritical ? 2 : 1;

        return {
            damageRoll: `${diceMulti}d6[${damageType}]`,
            flavor:     `Hunter's Mark (${damageType})`
        };
    }
}


/* ==========================================================================
    Helpers
   ========================================================================== */

/**
* Logs the global properties for the Macro to the console for debugging purposes
*
* @param  {Object}  props  Global properties
*/
function logProps (props) {
    console.groupCollapsed("%cmacro" + `%c${props.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
