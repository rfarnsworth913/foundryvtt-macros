/* ==========================================================================
    Macro:         Sanctuary
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Sanctuary",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    itemData: await fromUuid(lastArg.efData.origin),

    animation: {
        intro: "jb2a.bless.200px.intro.blue",
        loop: "jb2a.bless.200px.loop.blue"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Setup Sanctuary Hook ---------------------------------------------------
    const hookID = Hooks.on("midi-qol.AttackRollComplete", async (workflow) => {

        // Check target information -------------------------------------------
        if (workflow.targets.size !== 1) {
            return true;
        }

        const targetToken = workflow.targets.first();
        const targetActor = targetToken.actor;
        const targetEffect = await getEffect({
            actorData: targetActor,
            effectLabel: "Sanctuary"
        });

        if (!targetEffect) {
            return true;
        }

        // Set for saving throw -----------------------------------------------
        const targetItem = await fromUuidSync(targetEffect.origin);
        const { scaling } = targetItem.system.save;
        let spellDC = "";

        if (scaling === "spell") {
            spellDC = targetItem.actor.system.attributes.spelldc;
        } else {
            spellDC = targetItem.actor.system.abilities[scaling].dc;
        }

        // Handle saving throw -----------------------------------------------0
        const sourceActor = workflow.actor;
        const save = await sourceActor.rollAbilitySave("wis");
        if (save.total >= spellDC) {
            return true;
        }

        workflow.isFumble = true;
        ChatMessage.create({
            speaker: { alias: name },
            content: "Target is protected by Sanctuary!"
        });
    });

    DAE.setFlag(props.actorData, "sanctuary", hookID);

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
                .name(`Sanctuary-${props.tokenData.uuid}`)
                .waitUntilFinished(-500)
                .fadeIn(300)
                .fadeOut(300)
            .play();
    }
}

if (props.state === "off") {

    // Cleanup Sanctuary Hook -------------------------------------------------
    const hookID = DAE.getFlag(props.actorData, "sanctuary");
    DAE.unsetFlag(props.actorData, "sanctuary");

    Hooks.off("midi-qol.AttackRollComplete", hookID);

    // Animation --------------------------------------------------------------
    if ((game.modules.get("sequencer")?.active)) {
        Sequencer.EffectManager.endEffects({
            name: `Sanctuary-${props.tokenData.uuid}`,
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
