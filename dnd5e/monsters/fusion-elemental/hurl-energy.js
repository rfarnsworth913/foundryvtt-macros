/* ==========================================================================
    Macro:         Hurl Energy
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Hurl Energy",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    damageTypes: ["acid", "cold", "fire", "lightning"],
    isCritical:  lastArg.isCritical,
    target: canvas.tokens.get(lastArg.hitTargets[0]?.id) || null,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "OnUse" && props.target) {
    const damageRoll = await new Roll(props.isCritical ? "2d8 + 9 + 16" : "2d8 + 9").roll({ async: true });
    game?.dice3d.showForRoll(damageRoll);

    const index = Math.floor(Math.random() * props.damageTypes.length);

    await new MidiQOL.DamageOnlyWorkflow(
        props.actorData,
        props.tokenData,
        damageRoll.total,
        props.damageTypes[index],
        [props.target],
        damageRoll,
        {
            flavor:     `${props.name} (${CONFIG.DND5E.damageTypes[props.damageTypes[index]]})`,
            itemCardId: props.lastArg.itemCardId
        }
    );

    playAnimation(props.tokenData, props.target, index);
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

function playAnimation (source, target, index) {
    const animations = [
        {
            beam:      "jb2a.fireball.beam.dark_green",
            explosion: "jb2a.fireball.explosion.dark_green",
            ground:    "jb2a.ground_cracks.01.green"
        },
        {
            beam:      "jb2a.fireball.beam.blue",
            explosion: "jb2a.fireball.explosion.blue",
            ground:    "jb2a.ground_cracks.01.blue"
        },
        {
            beam:      "jb2a.fireball.beam.orange",
            explosion: "jb2a.fireball.explosion.orange",
            ground:    "jb2a.ground_cracks.01.orange"
        },
        {
            beam:      "jb2a.fireball.beam.purple",
            explosion: "jb2a.fireball.explosion.purple",
            ground:    "jb2a.ground_cracks.01.purple"
        }
    ];

    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file(animations[index].beam)
                .atLocation(source)
                .stretchTo(target)
            .effect()
                .file(animations[index].explosion)
                .atLocation(target)
                .scaleToObject(1.75)
                .delay(2100)
            .effect()
                .file(animations[index].ground)
                .atLocation(target)
                .belowTokens()
                .scaleIn(0.5, 150, { ease: "easeOutExpo" })
                .duration(5000)
                .fadeOut(3250, { ease: "easeInSine" })
                .name(`${props.name} Impact`)
                .delay(3200)
                .waitUntilFinished(-3250)
            .play();
    }
}
