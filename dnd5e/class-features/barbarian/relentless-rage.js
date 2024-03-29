/* ==========================================================================
    Macro:         Relentless Rage
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Relentless Rage",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    itemData: await fromUuid(lastArg.efData.origin),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    const hookID = Hooks.on("dnd5e.applyDamage", async () => {

        // Check if character is at zero HP
        const isAtZero = props.actorData.system.attributes.hp.value <= 0;
        const isRaging = await getEffect({ actorData: props.actorData, effectLabel: "Rage" });

        if (isAtZero && isRaging) {
            const { value } = props.itemData.system.uses;
            const saveDC = 10 + (5 * value);

            // Request save from user
            await game.MonksTokenBar.requestRoll([props.tokenData], {
                request:  "save:con",
                dc:       saveDC,
                flavor:   "Relentless Rage",
                showdc:   true,
                silent:   true,
                continue: "passed",
                rollMode: "request",
                callback: async () => {
                    await actor.update({ "system.attributes.hp.value": 1 });
                    await props.itemData.update({ "system.uses.value": value + 1 });
                }
            });
        }
    });

    DAE.setFlag(props.actorData, "relentlessRage", hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, "relentlessRage");
    DAE.unsetFlag(props.actorData, "relentlessRage");

    Hooks.off("dnd5e.applyDamage", hookID);
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

/**
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return (actorData.effects.find((effect) => {
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}
