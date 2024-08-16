/* ==========================================================================
    Macro:         Adhesive
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Adhesive",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg.item,
    tokenData,

    saveDC: 13,
    sizeSupport: ["tiny", "sm", "med", "lg", "huge"],

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    const hookID = Hooks.on("dnd5e.applyDamage", async (actor, amount, options) => {

        // Check if current actor is attacked ---------------------------------
        if (props.actorData.uuid !== actor.uuid) {
            return false;
        }

        // Check if melee attack is used --------------------------------------
        const itemData = options.midi.item;
        const attackType = itemData.system.actionType;


        if (attackType !== "mwak" && attackType !== "msak") {
            return false;
        }


        // Check target size --------------------------------------------------
        if (!props.sizeSupport.includes(actor.system.traits.size)) {
            return false;
        }

        // Setup adhesive effect ----------------------------------------------
        const effectData = {
            label: `${props.name}`,
            img: props.itemData.img,
            origin: props.lastArg.uuid,
            disabled: false,
            duration: {
                startRound: game.combat ? game.combat.round : 0,
                startTime: game.time.worldTime
            },
            changes: [
                {
                    key: "StatusEffect",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "grappled",
                    priority: 20
                },
                {
                    key: "flags.midi-qol.OverTime",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: `turn=start,label=Adhesive,rollType=skill,saveDC=${props.saveDC},actionSave=true,saveAbility=acr|ath`,
                    priority: 20
                }
            ]
        };

        await createEffects({
            actorData: options.midi.item.parent,
            effects: [effectData]
        });
    });

    DAE.setFlag(props.actorData, "adhesive", hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, "adhesive");
    DAE.unsetFlag(props.actorData, "adhesive");

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
