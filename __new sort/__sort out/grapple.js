//requires MidiQOL, Item Macro, Combat Utility Belt, DAE. Maybe more which I don't realise. 
// Thanks to Crymic, tposney, thatlonelybugbear, Freeze, Flix, Zhell, and errational for thier help in the Foundry discord and their own discords. 
//Create action, 1 action, Target: 1 creature, Range: Touch, Action type: Utility, On Use Macro: ItemMacro.

new Dialog({
  title: "Grapple Action",
  content: "Which Grapple Action?",
  buttons: {
    A: { label: "Grapple Target", callback: () => { return Grapple(); } },
    B: { label: "Break Free!", callback: () => { return BreakGrapple(); } },
  }
}).render(true);

async function Grapple(){
async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
let grappler = canvas.tokens.get(args[0].tokenId);
let defender = Array.from(game.user.targets)[0];
ChatMessage.create({'content': `${grappler.name} tries to hold ${defender.name} in place!`})
let tactorRoll = await grappler.actor.rollSkill("ath");
let skill = defender.actor.data.data.skills.ath.total < defender.actor.data.data.skills.acr.total ? "acr" : "ath";
let tokenRoll = await defender.actor.rollSkill(skill);
await wait(3000);
if (tactorRoll.total >= tokenRoll.total) {
const effectData = {
 label : "Grappled",
 icon : "modules/combat-utility-belt/icons/grappled.svg",
 duration: {seconds: 86400},
 changes: [{
   "key": "data.attributes.movement.all",        
   "mode": CONST.ACTIVE_EFFECT_MODES.CUSTOM,
   "value": "0",
   "priority": 20
   }]
} 
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: defender.actor.uuid, effects: [effectData] });
            ChatMessage.create({'content': `${grappler.name} succeeds in holding ${defender.name} in place!`})
}
            else 
            {
            ChatMessage.create({'content': `${defender.name} resists the grapple attempt from ${grappler.name}`})
            }
}



async function BreakGrapple(){
async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
let breaker = canvas.tokens.get(args[0].tokenId);
let grappler = Array.from(game.user.targets)[0];
ChatMessage.create({'content': `${breaker.name} tries to break free from ${grappler.name}!`})
let tactorRoll = await grappler.actor.rollSkill("ath");
let skill = breaker.actor.data.data.skills.ath.total < breaker.actor.data.data.skills.acr.total ? "acr" : "ath";
let tokenRoll = await breaker.actor.rollSkill(skill);
await wait(3000);
if (tokenRoll.total > tactorRoll.total) {
        let effect = breaker.actor.effects.find(i=> i.data.label === "Grappled");
        if(effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: breaker.actor.uuid, effects: [effect.id] });
        ChatMessage.create({'content': `${breaker.name} breaks away from ${grappler.name}!`})
        }
        else
        {
        ChatMessage.create({'content': `${grappler.name} continues to hold ${breaker.name} in place!`})
        }
}
