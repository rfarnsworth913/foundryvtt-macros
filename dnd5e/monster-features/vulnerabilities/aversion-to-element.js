/* ==========================================================================
    Macro:         Aversion to Fire
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Aversion to Fire",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    damageType: CONFIG.DND5E.damageTypes.fire.label.toLowerCase(),

    lastArg
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

        // Check for damage type ----------------------------------------------
        const itemData = options.midi.item;
        const isDamageTypeApplied = itemData.system.damage.parts.find((damagePart) => {
            if (damagePart[1].toLowerCase() === props.damageType) {
                return true;
            }

            return false;
        });

        if (!isDamageTypeApplied) {
            return false;
        }

        // Apply Effect to Target ---------------------------------------------
        const effectData = {
            label: `${props.name} (Active Effect)`,
            img: props.itemData.img,
            origin: props.lastArg.uuid,
            disabled: false,
            duration: {
                seconds: 12,
                startRound: game.combat ? game.combat.round : 0,
                startTime: game.time.worldTime
            },
            flags: {
                dae: {
                    specialDuration: ["turnEnd"]
                }
            },
            changes: [
                {
                    key: "flags.midi-qol.disadvantage.attack.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1",
                    priority: 20
                },
                {
                    key: "flags.midi-qol.disadvantage.ability.check.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1",
                    priority: 20
                }
            ]
        };

        await createEffects({
            actorData: actor,
            effects: [effectData]
        });
    });

    DAE.setFlag(props.actorData, "aversionElement", hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, "aversionElement");
    DAE.unsetFlag(props.actorData, "aversionElement");

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
