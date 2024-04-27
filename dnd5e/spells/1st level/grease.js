/* ==========================================================================
    Macro:         Grease
    Source:        Custom
    Usage:         Template Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const casterData = await fromUuidSync(template.flags["midi-qol"].actorUuid);
const casterRollData = casterData.getRollData();

const props = {
    name: "Grease",

    casterData,
    spellDC: casterRollData.attributes.spelldc,

    target: game.scenes.current.getEmbeddedDocument("Token", this.tokenId)
};

logProps(props);



/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("monks-tokenbar")?.active)) {
    return ui.notifications.error("Monks Token Bar is required!");
}

const prone = await getEffect({
    actorData: props.target.actor,
    effectLabel: "Prone"
});

if (prone) {
    return true;
}

await game.MonksTokenBar.requestRoll([props.target], {
    request:  "save:dex",
    dc:       props.spellDC,
    flavor:   props.name,
    showdc:   false,
    silent:   true,
    continue: "failed",
    rollMode: "request",
    callback: async (rollStatus) => {
        if (!rollStatus.passed) {
            const effectData = {
                label: "Prone",
                changes: [{
                    key: "StatusEffect",
                    value: "Convenient Effect: Prone",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    priority: 20
                }],
                icon: "assets/icons/dnd5e/monsters/features/passive/goblin-pox.webp",
                disabled: false,
                duration: {
                    seconds: 604800,
                    startTime: game.time.worldTime
                }
            };

            await createEffects({ actorData: props.target.actor, effects: [effectData] });
        }
    }
});

// Request saving throw
// Apply condition to tokens that failed


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
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    }));
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
