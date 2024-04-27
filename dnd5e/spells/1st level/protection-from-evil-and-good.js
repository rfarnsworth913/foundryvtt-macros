/* ==========================================================================
    Macro:         Protection from Evil and Good
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Protection from Evil and Good",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    itemData: await fromUuid(lastArg.efData.origin),

    races: ["aberration", "celestial", "elemental", "fey", "fiend", "undead"],

    animation: {
        intro: "jb2a.bless.200px.intro.green",
        loop: "jb2a.bless.200px.loop.green"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Setup Protection from Evil and Good Hook ---------------------------------------------------
    const hookID = Hooks.on("midi-qol.preAttackRoll", async (workflow) => {

        // Validate attack conditions -----------------------------------------
        if (workflow.targets.size !== 1) {
            return true;
        }

        if (workflow.disadvantage === true) {
            return true;
        }

        // Check if the target has the Protection from Evil and Good effect ---
        const targetToken = workflow.targets.first();
        const targetActor = targetToken.actor;
        const targetEffect = await getEffect({
            actorData: targetActor,
            effectLabel: "Protection from Evil and Good"
        });

        if (!targetEffect) {
            return true;
        }

        // Check if the attacker is of the specified type ---------------------
        let actorRace;
        if (targetActor.type === "npc") {
            actorRace = targetActor.system.details.type.value;
        } else {
            actorRace = targetActor.system.details.race;
        }

        if (!actorRace) {
            return true;
        }
        if (props.races.includes(actorRace.toLowerCase())) {
            workflow.disadvantage = true;
        }

        workflow.attackAdvAttribution["Protection From Evil and Good"] = true;
    });

    DAE.setFlag(props.actorData, "protectionEvilGood", hookID);

    // Animation --------------------------------------------------------------
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .scale(1.5)
                .file(props.animation.intro)
                .attachTo(props.tokenData)
                .waitUntilFinished(-500)
            .effect()
                .belowTokens()
                .scale(1.5)
                .file(props.animation.loop)
                .attachTo(props.tokenData)
                .persist()
                .name(`ProtectionEvilGood-${props.tokenData.uuid}`)
                .waitUntilFinished(-500)
                .fadeIn(300)
                .fadeOut(300)
            .play();
    }
}

if (props.state === "off") {

    // Cleanup Protection from Evil and Good Hook -------------------------------------------------
    const hookID = DAE.getFlag(props.actorData, "protectionEvilGood");
    DAE.unsetFlag(props.actorData, "protectionEvilGood");

    Hooks.off("midi-qol.preAttackRoll", hookID);

    // Animation --------------------------------------------------------------
    if ((game.modules.get("sequencer")?.active)) {
        Sequencer.EffectManager.endEffects({
            name: `ProtectionEvilGood-${props.tokenData.uuid}`,
            object: props.tokenData
        });
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
