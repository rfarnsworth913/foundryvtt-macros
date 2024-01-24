/* ==========================================================================
    Macro:         Eyes of the Grave
    Source:        Custom
    Usage:         OnUse | DAE
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Eyes of the Grave",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    animations: {
        selfDetect: "jb2a.detect_magic.circle.green",
        selfToken:  "jb2a.eyes.01.dark_green.single.0",
        target:     "jb2a.token_border.circle.static.green.001"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check sequencer ------------------------------------------------------------
if (!(game.modules.get("sequencer")?.active)) {
    return ui.notifications.error("Sequencer is required!");
}

// Animation On Targets -------------------------------------------------------
if (props.state === "OnUse") {
    const targets = props.lastArg.hitTargets;

    // Self Animation ---------------------------------------------------------
    new Sequence()
        .effect()
            .file(props.animations.selfToken)
            .atLocation(props.tokenData)
            .scaleToObject()
            .fadeIn(300)
            .fadeOut(300)
            .waitUntilFinished(-500)
        .effect()
            .file(props.animations.selfDetect)
            .atLocation(props.tokenData)
            .shape("circle", {
                radius: 6
            })
        .play();

    targets.forEach(async (target) => {
        const creatureTypes = ["undead"];
        const targetData = target.actor.getRollData();
        const undead = creatureTypes.some((type) => {
            return ((targetData.details?.type?.custom || targetData.details?.type?.value) ||
                (targetData.details?.race?.name || targetData.details?.race))
                ?.toLowerCase()?.includes(type) || "";
        });

        console.warn("Target Information: ", target, undead);

        if (undead) {
            const animationTarget = await canvas.tokens.get(target.id);

            new Sequence()
                .effect()
                    .delay(5500)
                    .file(props.animations.target)
                    .attachTo(animationTarget)
                    .scaleToObject(1.75)
                    .persist()
                    .fadeIn(300)
                    .fadeOut(300)
                    .name(`EyesoftheGrave-${props.tokenData.id}`)
                .play();
        }
    });
}


// Animation Off --------------------------------------------------------------
if (props.state === "off") {
    Sequencer.EffectManager.endEffects({
        name: `EyesoftheGrave-${props.tokenData.id}`
    });
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
