/* ==========================================================================
    Macro:         Blessed Healer
    Usage:         DamageBonus
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Blessed Healer",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg.actor || {},
    itemData: lastArg.itemData,
    tokenData: await fromUuidSync(lastArg.tokenUuid) || {},

    damageType: CONFIG.DND5E.healingTypes.healing.label.toLowerCase(),

    targets: lastArg.targets || [],

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Validation Logic -----------------------------------------------------------
let selfTarget = false;
props.targets.forEach((target) => {
    selfTarget = target.actorId === props.actorData.id ? true : false;
});

if (props.itemData.type !== "spell" ||
    workflow.castData.castLevel < 1 ||
    workflow.rawDamageDetail[0].type !== props.damageType ||
    (selfTarget && props.targets.length === 1)) {
    return false;
}


// Apply Healing to Self ------------------------------------------------------
const healingRoll = await new CONFIG.Dice.DamageRoll(`${2 + workflow.castData.castLevel}`, {}, { type: props.damageType }).evaluate();
// eslint-disable-next-line no-new
new MidiQOL.DamageOnlyWorkflow(
    actor,
    token,
    healingRoll.total,
    props.damageType,
    [props.tokenData],
    healingRoll,
    {
        flavor: "Blessed Healer",
        itemCardUuid: props.lastArg.itemCardUuid
    }
);

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
