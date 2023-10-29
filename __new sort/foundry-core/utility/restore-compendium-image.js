/* ==========================================================================
    Macro:         Restore Compendium Images
    Source:        https://gitlab.com/-/snippets/2138719
    Usage:         Standard Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const props = {
    name: "Restore Compendium Images",
    packs: [
        "ancestries",
        "backgrounds",
        "heritages",
        "equipment",
        "feats-srd",
        "spells"
    ],

    folderName: encodeURI(`${game.system.id}CompendiumMappingBackup`)
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

ui.notifications.info("Starting import, this may take some time");

const folderList = await FilePicker.browse("data", props.folderName);
const files = folderList.files.filter((file) => {
    return file.endsWith(".json");
});

console.log(files);

for (const file of files) {
    const gamepack = file.split("/").pop().replace(".json", "");
    console.log(gamepack);
    // eslint-disable-next-line no-await-in-loop
    await importMappingItems(gamepack);
}

ui.notifications.info("Finished importing images");


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
 * Returns a JSON object from a given path
 *
 * @param  {string}  path  Path for the JSON file
 * @returns                JSON object
 */
async function getJSON (path) {
    const response = await fetch(path);
    return response.json();
}

async function importMappingItems (gamePack) {
    const filepath = `${props.folderName}/${gamePack}.json`;
    const items    = await getJSON(filepath);

    console.log(filepath);
    console.log(items);

    const updates  = items.map((item) => {
        return({ _id: item.id, img: item.img});
    });

    try {
        const pack = game.packs.get(gamePack);
        pack.configure({ locked: false });

        const docs    = await pack.getDocuments();
        const updated = await Item.updateDocuments(updates, { pack: gamePack });

        pack.configure({ locked: true });
        ui.notifications.info(`Updated ${updated.length} items in ${gamePack}`);
    } catch (error) {
        console.error(`Could not load data for ${gamePack}.  That pack may not exist in this world or it may be damaged.`);
        console.error(error);
    }
}
