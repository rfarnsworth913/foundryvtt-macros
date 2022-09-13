let buttonid = "odDhQ6Qza7BHC9PP";
let buttoncheck = canvas.scene.drawings.filter(d => d.id == buttonid);
let response = '';

  if(buttoncheck[0].data.fillColor == '#750000') {

    new Dialog({
      title:'Login Screen',
      content:`
        <form>
          <div class="form-group">
            <label>Password</label>
            <input type='text' name='inputField'></input>
          </div>
        </form>`,
      buttons:{
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: `Submit`
        }},
      default:'yes',
      close: html => {
        let result = html.find('input[name=\'inputField\']');
        if (result.val()== 'hello there') {
           response = 'Teleport';
         }
        else {
          response = 'Bad Password';
        }
      }
    }).render(true);

   }

   else {       
       response = 'Teleport';
   }



return new Promise(resolve => {
function waitForIt() {
        if (response == '') {
            setTimeout(function(){waitForIt()},1000);
        } 
        else {
          resolve({goto: response});
        }
     }
waitForIt()
});
