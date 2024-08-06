/* ==========================================================================
    Macro:         Loot Piles Population
    Source:        Custom
    Usage:         Global Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const props = {
    name: "Loot Piles Population"
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("tagger")?.active)) {
    return ui.notifications.error("Tagger is required!");
}

if (!(game.modules.get("item-piles")?.active)) {
    return ui.notifications.error("Item Piles is required!");
}

// Get information from user on what to populate ------------------------------
const lootTablesList = game.tables.reduce((acc, table) => {
    return acc += `<option value="${table.name}">${table.name}</option>`;
}, "");

const menu = await new Dialog({
    title: "",
    content: `
        <style>

        </style>

        <section>
            <form>
                <div class="form-group">
                    <label for="tags">Tagger Tag: </label>
                    <input type="text" id="tags" />
                </div>

                <div class="form-group">
                    <label for="lootTables">Loot Table: </label>
                    <select id="lootTables">${lootTablesList}</select>
                </div>

                <div class="form-group">
                    <label for="rollFormula">Roll Formula</label>
                    <input type="text" id="rollFormula" />
                </div>

                <div class="form-group">
                    <label for="removeItems">Remove Existing Items</label>
                    <input type="checkbox" id="removeItems" />
                </div>
            </form>
        </section>
    `,
    buttons: {
        apply: {
            label: "Apply",
            callback: async (html) => {
                const tag = html.find("#tags").val() || "";
                const lootTable = html.find("#lootTables").val() || "";
                const roll = html.find("#rollFormula").val() || "";
                const removeItems = html.find("#removeItems").prop("checked");

                if (tag === "" || lootTable === "" || roll === "") {
                    return ui.notifications.error("All fields are required!");
                }

                populateItemPiles(tag, lootTable, roll, removeItems);
            }
        },

        cancel: {
            label: "Cancel",
            callback: () => {
                return false;
            }
        }
    }
});

return menu.render(true);


// Handle content population --------------------------------------------------
function populateItemPiles (tag, lootTable, roll, removeItems = false) {

    // Select item piles to update
    const targets = Tagger.getByTag(tag);

    // Loop tokens, convert to Item Pile, and populate
    targets.forEach(async (target) => {
        console.info("Processing target: ", target);

        const targetImage = target.actor.prototypeToken.texture.src;
        const targetName  = target.name;

        await game.itempiles.API.turnTokensIntoItemPiles([target]);
        await game.itempiles.API.rollItemTable(lootTable, {
            timesToRoll: roll,
            targetActor: target.actor,
            removeExistingActorItems: removeItems
        });

        await canvas.scene.updateEmbeddedDocuments("Token", [{
            _id: target.id,
            img: targetImage,
            name: targetName
        }]);
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
