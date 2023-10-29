/* ==========================================================================
    Macro:         Blindness/Deafness
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Blindness/Deafness",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData,
    tokenData,

    spellDC: tokenData.actor.system.attributes.spelldc,
    targets: lastArg.failedSaves,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Check for target -------------------------------------------------------
    if (!props.targets.length === 0) {
        return false;
    }

    // Condition Dialog -------------------------------------------------------
    const dialogContent = `
        <div style="display: flex; align-items: flex-start; margin-bottom: 5px;">
            <input type="radio" id="blindness" name="condition" checked />
            <label style="margin-left: 5px;" for="blindness">Blindness</label>
        </div>

        <div style="display: flex; align-items: flex-start;">
            <input type="radio" id="deafness" name="condition" />
            <label style="margin-left: 5px;" for="deafness">Deafness</label>
        </div>
    `;

    new Dialog({
        title: `Choose ${props.name}`,
        content: `
            <form class="form-group flexcol" style="align-items: left; padding: 5px;"
                <fieldset style="border: none">
                    ${dialogContent}
                </fieldset>
            </form>
        `,
        buttons: {
            apply: {
                icon: "<i class=\"fas fa-check\"></i>",
                label: "Apply",
                callback: async (html) => {
                    const selectedOption = html.find("input:checked")?.[0].id;
                    const statusEffect = selectedOption === "blindness" ? "Blinded" : "Deafened";

                    const effectData = [{
                        changes: [
                            {
                                key:      "StatusEffect",
                                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:    `Convenient Effect: ${statusEffect}`,
                                priority: 20
                            },
                            {
                                key:      "flags.midi-qol.OverTime",
                                mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                value:    `
                                    turn=start,
                                    label=Blindness/Deafness,
                                    saveDC=${props.spellDC},
                                    saveAbility=con,
                                    saveMagic=true
                                `,
                                priority: 20
                            }
                        ],
                        origin: props.itemData.uuid,
                        disabled: false,
                        duration: {
                            seconds:    60,
                            rounds:     10,
                            startRound: game.combat ? game.combat.round : 0,
                            startTime:  game.time.worldTime
                        },
                        icon:  props.itemData.img,
                        label: props.itemData.name
                    }];

                    props.targets.forEach(async (target) => {
                        const { actor } = canvas.tokens.get(target.id);
                        await createEffects({
                            actorData: actor,
                            effects:  effectData
                        });
                    });
                }
            },
            cancel: {
                icon: "<i class=\"fas fa-times\"></i>",
                label: "Cancel"
            }
        }
    }).render(true);

    // Create effect data
    // Apply effect to target
    // Animations?
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
