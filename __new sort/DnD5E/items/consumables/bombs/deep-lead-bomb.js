/* ==========================================================================
    Macro:         Deep Lead Bomb
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Deep Lead Bomb",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    targets: lastArg.hitTargets,

    saveDC: 15,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Filter targets -------------------------------------------------------------
const targets = props.targets.reduce((list, target) => {
    if (target.actor.getRollData().attributes.hp.value === 0) {
        return list;
    }

    list.push(target);

    return list;
}, []);


// Save for poisoning ---------------------------------------------------------
targets.forEach(async (target) => {
    const save = await MidiQOL.socket().executeAsGM("rollAbility", {
        request:    "save",
        targetUuid: target.actor.uuid,
        ability:    "con",
        options:    {
            advantage:   false,
            chatMessage: true,
            fastForward: false
        }
    });

    if (props.saveDC > save.total) {
        const tokenData = await fromUuid(target.uuid);
        const actorData = tokenData.actor;
        const effectData = {
            changes: [
                {
                    key:      "macro.CE",
                    mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value:    "Poisoned",
                    priority: 20
                },
                {
                    key:      "flags.midi-qol.OverTime",
                    mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value:    "turn=end,\nsaveAbility=con,\nsaveDC=15,\nlabel=\"Deep Lead Poisoning\"",
                    priority: 20
                }
            ],
            label: "Deep Lead Poisoning",
            icon:  "icons/svg/poison.svg",
            tint:  "#06b003",
            disabled: false,
            duration: {
                rounds:     10,
                seconds:    60,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            }
        };

        await createEffects({
            actorData,
            effects: [effectData]
        });

        await removeEffect({
            actorData,
            effectLabel: "Concentrating"
        });
    }
});


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

/**
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect.id]
    });
}
