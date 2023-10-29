/* ==========================================================================
    Macro:         Spirit Guardians
    Source:        MidiQOL Database
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Spirit Guardians",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    itemData: await fromUuid(lastArg.origin),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on" && args[1] !== props.lastArg.tokenId && props.lastArg.tokenId === game?.combat.current.tokenId) {

    // Get target actor -------------------------------------------------------
    let targetActor = await fromUuid(props.lastArg.actorUuid);
    if (targetActor.actor) {
        targetActor = targetActor.actor;
    }

    // Item Setup -------------------------------------------------------------
    const itemData = mergeObject(duplicate(props.itemData.toObject(false)), {
        type: "weapon",
        effects: [],
        flags: {
            "midi-qol": {
                noProvokeReaction: true,
                onUseMacroName:    null
            }
        },
        system: {
            actionType: "save",
            save: {
                dc:      Number.parseInt(args[3]),
                ability: "wis",
                scaling: "flag"
            },
            damage: {
                parts: [[`${args[2]}d8`, "radiant"]]
            },
            "target.type": "self",
            componens: {
                concentration: false,
                material:      false,
                ritual:        false,
                somatic:       false,
                value:         "",
                vocal:         false,
            },
            duration: {
                units: "inst",
                value: undefined
            },
            weaponType: "improv"
        }
    }, {
        overwrite:    true,
        inlace:       true,
        insertKeys:   true,
        insertValues: true
    });

    itemData.system.target.type = "self";
    setProperty(itemData.flags, "autoanimations.killAnim", true);
    itemData.flags.autoanimations.killAnim = true;

    // Apply to target --------------------------------------------------------
    const item = new CONFIG.Item.documentClass(itemData, { parent: targetActor });
    const options = {
        showFullCard:    false,
        createWorkflow:  true,
        versatile:       false,
        configureDialog: false
    };

    await MidiQOL.completeItemRoll(item, options);
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
