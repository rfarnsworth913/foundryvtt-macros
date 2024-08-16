/* ==========================================================================
    Macro:         Sneak Attack
    Source:        Custom
    Usage:         DamageBonusMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Sneak Attack",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    targetData: game.user.targets?.first(),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Get advantage status ---------------------------------------------------
    let { advantage } = props.lastArg;

    // Check for nearby allies ------------------------------------------------
    if (!advantage) {
        const nearbyAllies = MidiQOL.findNearby("Hostile", props.targetData, 5, {
            includeIncapacitated: false
        });

        if (nearbyAllies.length > 0) {
            advantage = true;
        }
    }

    if (advantage) {
        const damageType = props.lastArg.damageDetail[0].type;
        console.warn("Damage Type: ", damageType);
        return {
            damageRoll: `2d6[${damageType}]`,
            flavor: `${props.name} Damage Bonus`
        };
    }
}


/* ==========================================================================
    Helpers
   ========================================================================== */

/**
* Logs the global properties for the Macro to the console for debugging purposes
*
* @param  {Object}  appProps  Global properties
*/
function logProps (appProps) {
    console.groupCollapsed(`%cmacro %c${appProps.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");
    Object.keys(appProps).forEach((key) => {
        console.log(`${key}: `, appProps[key]);
    });
    console.groupEnd();
}
