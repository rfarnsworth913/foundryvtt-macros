/* ==========================================================================
    Macro:         Scorching Ray
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Scorching Ray",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    boltNumber: lastArg.spellLevel + 1,
    damageType: CONFIG.DND5E.damageTypes.fire.label.toLowerCase(),
    itemData:   lastArg.item,
    spellLevel: lastArg.spellLevel,
    targets:    lastArg.hitTargets,

    animation: "jb2a.scorching_ray.orange",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Handle targeting -----------------------------------------------------------
if (props.targets.length === 0) {
    return ui.notifications.error("No targets selected for Sorching Ray!");
}

let targetData = [];
let errorMessage = "";

if (props.targets.length === 1) {
    targetData = [{
        target: props.targets[0].id,
        bolts:  props.boltNumber
    }];
} else {
    targetData = await targetingDialog(props.targets);
}

// Check for errors -----------------------------------------------------------
if (errorMessage) {
    return ui.notifications.error(errorMessage);
}

// Handle damage rolls --------------------------------------------------------
targetData.forEach(async (targetData) => {
    const target = await canvas.tokens.get(targetData.target);
    const damageFormula = "2d6";

    for (let i = 0; i < targetData.bolts; i++) {
        const targetAC = target.actor.system.attributes.ac.value;
        const casterAttributes = props.actorData.system.attributes;
        // eslint-disable-next-line no-await-in-loop
        const attackRoll = await new Roll(`1d20 + ${casterAttributes.prof} + ${casterAttributes.spellmod}`).roll();

        logProps({ name: `${props.name} Attack Roll`, attackRoll, targetAC });

        if (attackRoll.total > targetAC || attackRoll.total === 20) {
            // eslint-disable-next-line no-await-in-loop
            await animation(props.tokenData, target, targetData.bolts);
            // eslint-disable-next-line no-await-in-loop
            const damage = await new game.dnd5e.dice.DamageRoll(damageFormula, props.actorData, {}).roll();
            // eslint-disable-next-line no-await-in-loop
            await new MidiQOL.DamageOnlyWorkflow(
                props.actorData,
                props.tokenData,
                damage.total,
                props.damageType,
                [target],
                damage,
                {
                    flavor: "Scorching Ray",
                    itemCardId: lastArg.itemCardId
                }
            );
        }
    }
});


/**
 * Handles creating and returning targeting information from a custom targeting dialog box
 *
 * @param {Token5e} targets Scorching Targets
 * @returns                 Targeting or error information
 */
// eslint-disable-next-line max-lines-per-function
function targetingDialog (targets) {

    // Dialog Content -------------------------------------------------------------
    const targetContent = targets.reduce((list, target) => {
        const image = target.texture.src;

        return list += `
        <label for="${target.id}" class="radio-label">
            <img src="${image}" style="border: 0; width: 50px; height: 50;" />
            ${target.actor.name}
            <input type="number" id="${target.id}" name="beamCount" value="0" min="0" max="12" />
        </label>
    `;
    }, []);

    // Render Dialog Box ----------------------------------------------------------
    return Dialog.wait({
        title: "Scorching Ray Damage",
        content: `
        <style>
                #magicMissile .form-group {
                    display: flex;
                    flex-direction: column;
                    flex-wrap: wrap;
                    width: 100%;
                    align-items: flex-start;
                }

                #magicMissile img {
                    border: 0;
                    width: 50px;
                    height: 50px;
                    flex: 0 0 50px;
                    margin-right: 7px;
                }

                #magicMissile label {
                    display: flex;
                    align-items: center;
                    flex: 0 0 100%;
                    justify-content: start;
                    width: 100%;
                }

                #magicMissile input[type="number"] {
                    display: inline-block;
                    margin-left: auto;
                    width: 50px;
                }

            </style>
            <form id="magicMissile">
                <p>You currently have ${props.boltNumber} total Scorching Rays.</p>
                <hr />
                <div class="form-group">
                    ${targetContent}
                </div>
            </form>
    `,
        buttons: {
            damage: {
                label: "Damage",
                callback: async (html) => {
                    const targets = await html.find("input[name='beamCount']");
                    const targetData = [];
                    let spentBolts = 0;

                    for (const selectedTarget of targets) {
                        if (selectedTarget.value > 0) {
                            spentBolts += parseInt(selectedTarget.value);
                            targetData.push({
                                target: selectedTarget.id,
                                bolts: selectedTarget.value
                            });
                        }
                    }

                    if (spentBolts > props.boltNumber) {
                        errorMessage = "You have spent more rays than you have available!";
                    }

                    if (spentBolts === 0) {
                        errorMessage = "The spell fails, no rays were spent!";
                    }

                    return targetData;
                }
            },
            cancel: {
                label: "Cancel",
                callback: async () => {
                    return [];
                }
            }
        }
    });
}

/**
 * Magic Missile Animation
 *
 * @param {Token5e} caster  Caster
 * @param {Token5e} target  Target
 * @param {number} bolts    Number of Bolts
 */
async function animation (caster, target, bolts) {
    if ((game.modules.get("sequencer")?.active)) {
        const fire = new Sequence()
            .effect()
            .file(props.animation)
            .atLocation(caster)
            .stretchTo(target)
            .repeats(Number(bolts), 500, 500)
            .randomizeMirrorY();

        return fire.play();
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
