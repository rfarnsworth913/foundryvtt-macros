/* ==========================================================================
    Macro:         Bardic Inspiration
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Bardic Inspiration",
    state: args[0]?.tag || args[0] || "unknown",

    // Caster (Bard)
    actorData: tokenData?.actor || {},
    tokenData,
    itemData: lastArg.itemData,

    // Target (Bardic Inspiration Target)
    targetActor: lastArg.hitTargets[0]?.actor,
    targetToken: lastArg.hitTargets[0],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Bardic Inspiration -----------------------------------------------------
    const inspirationDice = props.actorData.getRollData().scale.bard["bardic-inspiration"];
    const effectData = {
        changes: [
            {
                key:      "flags.midi-qol.optional.NAME.label",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    "Bardic Inspiration",
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.NAME.save.all",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${inspirationDice}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.NAME.check.all",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${inspirationDice}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.NAME.skill.all",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${inspirationDice}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.NAME.attack.all",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${inspirationDice}`,
                priority: 20
            }
        ],
        origin: props.lastArg.origin,
        disabled: false,
        duration: {
            rounds:     60,
            seconds:    600,
            startRound: game.combat ? game.combat.round : 0,
            starTime:   game.time.worldTime
        },
        icon:  props.itemData.img,
        label: props.itemData.name
    };

    // Check for mutations
    await checkMagicalInspiration(props.actorData, effectData, inspirationDice);
    await checkMoteofPotential(props.actorData, effectData, inspirationDice);

    await props.targetActor.createEmbeddedDocuments("ActiveEffect", [effectData]);


    // Play animations --------------------------------------------------------
    casterAnimation();
}

//    - Bardic Inspiration Animation:
//        - On Target
//        - {{ Other RPG Task }}
//    - Handle Mote of Potential Detection
//    - {{ Other RPG Task }}
//    - Ability Score: Modifies the effect data before pushing to target
//    - {{ Other RPG Task }}
//    - Attack:
//        - Dialog to Detect Attack?
//        - MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE, target, 5, null)
//        - Request saving throw(s) requestRoll
//            let save         = await MidiQOL.socket().executeAsGM("rollAbility", {
//                request: "save",
//                targetUuid: target.actor.uuid,
//                ability: props.saveType,
//                options: getAdvantage
//            });

//            rollSave

//        - MidiQOL Damage Workflow
//    - {{ Other RPG Task }}
//    - Saving Throw:
//        - Dialog to Detect Saving Throw?
//        - Allow entry of saving throw into dialog
//        - Apply temporary HP to character


/* ==========================================================================
    Helpers
   ========================================================================== */

/**
* Logs the global properties for the Macro to the console for debugging purposes
*
* @param  {Object}  props  Global properties
*/
function logProps (props) {
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
 * Handles animations on the caster
 */
function casterAnimation () {
    if (game.modules.get("sequencer")?.active) {
        new Sequence()
            .effect()
                .file("jb2a.music_notations.bass_clef.blue")
                .scale(0.5)
                .atLocation(props.tokenData)
                .waitUntilFinished(-1250)
            .effect()
                .file("jb2a.music_notations.beamed_quavers.blue")
                .scale(0.5)
                .atLocation(props.tokenData)
                .waitUntilFinished(-1250)
            .effect()
                .file("jb2a.music_notations.crotchet.blue")
                .scale(0.5)
                .atLocation(props.tokenData)
                .waitUntilFinished(-1250)
            .effect()
                .file("jb2a.music_notations.flat.blue")
                .scale(0.5)
                .atLocation(props.tokenData)
                .waitUntilFinished(-1250)
            .effect()
                .file("jb2a.music_notations.quaver.blue")
                .scale(0.5)
                .atLocation(props.tokenData)
                .waitUntilFinished(-1250)
            .effect()
                .file("jb2a.music_notations.sharp.blue")
                .scale(0.5)
                .atLocation(props.tokenData)
                .waitUntilFinished(-1250)
            .effect()
                .file("jb2a.music_notations.treble_clef.blue")
                .scale(0.5)
                .atLocation(props.tokenData)
                .waitUntilFinished(-1250)
            .play();
    }
}

/**
 * Handles applying effects of Magical Inspiration
 *
 * @param  {Actor5e}       actorData        Actor to be checked for data
 * @param  {ActiveEffect}  effectData       Effect data to be modified
 * @param  {string}        inspirationDice  Roll string for dice information
 */
async function checkMagicalInspiration (actorData, effectData, inspirationDice) {
    const ability = await getItems({
        actorData,
        itemLabel: "Magical Inspiration"
    });

    if (ability.length > 0) {
        effectData.changes = [
            ...effectData.changes,
            {
                key:      "flags.midi-qol.optional.NAME.damage.heal",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${inspirationDice}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.NAME.damage.msak",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${inspirationDice}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.NAME.damage.rsak",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${inspirationDice}`,
                priority: 20
            }
        ];
    }
}

/**
 * Handles applying effects of Magical Inspiration
 *
 * @param  {Actor5e}       actorData        Actor to be checked for data
 * @param  {ActiveEffect}  effectData       Effect data to be modified
 * @param  {string}        inspirationDice  Roll string for dice information
 */
 async function checkMoteofPotential (actorData, effectData, inspirationDice) {
    const ability = await getItems({
        actorData,
        itemLabel: "Mote of Potential"
    });

    if (ability.length > 0) {
        console.warn("Mote Found");
    }
}

/**
 * Returns a collection of items that have the specified label
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems ({ actorData, itemLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified");
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase();
    }));
}
