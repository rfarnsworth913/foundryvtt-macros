//Create an Actor Named "Create Bonfire" And assign token image that you wish converted to a tile

//Summmon Actor to location
const summoned = await warpgate.spawn("Create Bonfire", {}, {}, {});
const summonedUuid = `Scene.${canvas.scene.id}.Token.${summoned[0]}`;

//Select Token
let tokenSelect = canvas.tokens.placeables.find(t => t.name === 'Create Bonfire');
tokenSelect.control();

// Convert Actor to Tile

if (canvas.tokens.controlled)
{

const tkn = canvas.tokens.controlled[0];
const tokenData = tkn.data;

let newTile = [{
      img: tokenData.img,
      width: tokenData.width * canvas.grid.size,
      height: tokenData.height * canvas.grid.size,
      scale: tokenData.scale,
      x: tokenData.x,
      y: tokenData.y,
      z: 500 - (100 * token.data.width * token.data.height),
      rotation: tokenData.rotation,
      hidden: tokenData.hidden,
      locked: false,
    }];

await canvas.scene.createEmbeddedDocuments("Tile", newTile);

//Create Ambient Light at Token Location

let newAmbientLight = [{
    t: "l", // l for local. The other option is g for global.
    x: tokenData.x, // horizontal positioning
    y: tokenData.y, // vertical positioning
    rotation: 0, // the beam direction of the light in degrees (if its angle is less than 360 degrees.)
    config: {
    dim: 40, // the total radius of the light, including where it is dim.
    bright: 20, // the bright radius of the light
    angle: 360, // the coverage of the light. (Try 30 for a "spotlight" effect.)
    // Oddly, degrees are counted from the 6 o'clock position.
    color: "#ff9500", // Light coloring.
    alpha: 0.2 // Light opacity (or "brightness," depending on how you think about it.)
    }
}];

await canvas.scene.createEmbeddedDocuments("AmbientLight", newAmbientLight);

//Delete Token

tkn.document.delete();

}
else
{
    ui.notifications.error(`${this.name} expects a single token to be selected`);
}
