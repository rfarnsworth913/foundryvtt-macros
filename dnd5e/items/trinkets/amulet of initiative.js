/* ==========================================================================
    Macro:         Amulet of Initiative
    Source:        https://www.patreon.com/posts/amulet-of-91943508
    Usage:         On Combat Start Hook
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Amulet of Initiative",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: await fromUuid(lastArg.origin),
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    const hookID = Hooks.on("combatStart", async () => {
        const effect = {
            changes: [{
                key:      "system.attributes.movement.walk",
                mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
                value:    "10",
                priority: 20
            }],
            origin: props.itemData.uuid,
            disabled: false,
            flags: {
                dae: {
                    specialDuration: "turnStartSource"
                }
            },
            duration: {
                rounds:      1,
                truns:       1,
                seconds:     12,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            label: "Amulet of Initiative - Speed",
            icon:  props.itemData.img
        };

        await createEffects({ actorData: props.actorData, effects: [effect] });
    });

    DAE.setFlag(props.actorData, "amuletOfInitiative", hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, "amuletOfInitiative");
    DAE.unsetFlag(props.actorData, "amuletOfInitiative");

    Hooks.off("combatStart", hookID);
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
 * Creates an effect on a selected actor
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actor        Target actor
 * @param    {Array<object>}  effects  Effects to be applied to target
 * @returns  {Promise<Function>}       Deletion status of effect
 */
async function createEffects ({ actorData, effects = [] } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    if (!effects || effects.length === 0) {
        return console.error("No effects specified");
    }

    return await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: actorData.uuid,
        effects
    });
}
