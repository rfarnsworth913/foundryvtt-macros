/* ==========================================================================
    Macro:         Fire Shield
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Fire Shield",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  await fromUuid(lastArg.origin),
    tokenData,

    compendiumID: "shared-compendiums.shared-spells",
    itemLabel:    "",

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

if (props.state === "on") {

    // Choose Cold or Fire ----------------------------------------------------
    new Dialog({
        title: `${props.name} Type`,
        content: `
            <form class="form-group flexcol" style="align-items: left; padding: 5px;">
                <fieldset style="border: none">
                    <div style="padding-top: 3px; padding-bottom: 3px; display: flex; align-items: center;">
                        <input style="margin-right: 10px; top: 0;" type="radio" id="fire" name="fireShieldType" checked />
                        <label for="fire">Fire</label>
                    </div>
                    <div style="padding-top: 3px; padding-bottom: 3px; display: flex; align-items: center;">
                        <input style="margin-right: 10px; top: 0;" type="radio" id="cold" name="fireShieldType" />
                        <label for="cold">Cold</label>
                    </div>
                </fieldset>
            </form>
        `,
        buttons: {
            apply: {
                icon: "<i class=\"fas fa-check\"></i>",
                label: "Apply",
                callback: async (html) => {
                    const fireShieldType = html.find("input:checked")?.[0].id;
                    await applyUpdates({
                        actorData: props.actorData,
                        fireShieldType
                    });
                }
            },
            cancel: {
                icon: "<i class=\"fas fa-times\"></i>",
                label: "Cancel"
            }
        }
    }).render(true);
}

if (props.state === "off") {
    await warpgate.revert(props.tokenData.document, props.itemLabel);
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
 * Handles applying required changes to the character
 *
 * @param  {object}   [options]
 * @param  {Actor5e}  actorData       Actor to be updated
 * @param  {string}   fireShieldType  Type of field shield applied to character
 */
async function applyUpdates ({ actorData, fireShieldType } = {}) {

    // Apply Resistance -------------------------------------------------------
    const label = fireShieldType.charAt(0).toUpperCase() + fireShieldType.slice(1);
    props.itemLabel = `Fire Shield (${label})`;

    const effectData = [{
        changes: [
            {
                key:      "system.traits.dr.value",
                mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
                value:    fireShieldType,
                priority: 20
            }
        ],
        label:    `${props.name} (${label})`,
        icon:     props.itemData.img,
        origin:   props.lastArg.origin,
        disabled: false,
        duration: {
            rounds:     60,
            seconds:    600,
            startRound: game.combat ? game.combat.round : 0,
            startTime:  game.time.worldTime
        }
    }];

    await createEffects({
        actorData,
        effects: effectData
    });


    // Get source item --------------------------------------------------------
    const compendium = game.packs.get(props.compendiumID);
    const orgItem    = await compendium.getDocuments({ name: props.itemLabel });

    if (orgItem.length === 0) {
        return false;
    }


    // Mutate the item --------------------------------------------------------
    const itemData = duplicate(orgItem[0]);


    // Add item to target -----------------------------------------------------
    const updates = {
        embedded: {
            Item: {
                "Fire Shield (Attack)": {
                    ...itemData
                }
            }
        }
    };

    await warpgate.mutate(props.tokenData.document, updates, {}, {
        name:        props.itemLabel,
        description: `Adding ability: ${props.itemLabel}`
    });

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
