/* ==========================================================================
    Macro:         Assassinate
    Source:        https://www.patreon.com/posts/assassinate-108847150
    Usage:         DAE On Item Use Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Assassinate",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    itemUuid:   lastArg?.uuid || lastArg?.itemUuid,
    targetList: Array.from(lastArg.targets),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
const findCombatant = game?.combat?.combatants?.find((i) => {
    return props.targetList.find((x) => {
        return x.id === i.tokenId;
    });
});

const mWorkflow = await workflow;

if (!game.combat || !findCombatant) {

    // Check for surprise attack ----------------------------------------------
    const choice = await new Promise(async (resolve) => {
        await new Dialog({
            title: "Assassinate: Surprise Attack",
            content: "Is this a surprise attack?",
            buttons: {
                yes: {
                    label: "Yes",
                    callback: () => {
                        resolve(true);
                    }
                },
                no: {
                    label: "No",
                    callback: () => {
                        resolve(false);
                    }
                }
            }
        }).render(true);
    });

    if (choice) {
        const effectData = [{
            name: "Assassinate Bonus",
            duration: {
                rounds: 1,
                seconds: 6,
                startRound: game.combat ? game.combat.round : 0,
                startTime: game.time.worldTime
            },
            flags: {
                dae: {
                    selfTarget: true,
                    stackable: "noneOrigin",
                    durationExpression: "",
                    macroRepeat: "",
                    specialDuration: ["DamageDealt"],
                    transfer: false
                }
            },
            changes: [{
                key: "flags.midi-qol.critial.all",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 1,
                priority: 20
            }]
        }];

        await createEffects({
            actorData: props.actorData,
            effects: effectData
        });
    }

    return mWorkflow.advantage = true;
} else {
    const currentCombatant = game.combat.combatants.find((i) => {
        return i.tokenId === props.tokenData.id;
    });

    const initTargets = game.combat.combatants.reduce((list, combatant) => {
        if (combatant.tokenId === props.tokenData.id) {
            return list;
        }

        if (combatant.initiative > currentCombatant.initiative) {
            return list;
        }

        const messagesList = game.messages.contents.filter((messages) => {
            return messages?.speaker?.token === combatant.tokenId && messages?.flags?.dnd5e?.roll?.type === "midi"
        });

        if (messagesList.length === 0) {
            return list;
        }

        list.push(combatant.tokenId);
        return list;
    }, []);

    const confirmedAction = props.targetList.filter((target) => {
        return initTargets.includes(target.id);
    });

    if (confirmedAction.length > 0) {
        return;
    }

    return mWorkflow.advantage = true;
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
