
/*function aggiungiElemento(){
    const input=document.getElementById("todo-input");
    const lista=document.getElementById("lista-task");
    let testo=input.value;
    if(testo==="") return;
    let li=document.createElement("li");
    li.innerHTML=`
        <span>${testo}</span>
        <span class="delete-btn" onclick="this.parentElement.remove()">X</span>
    `;
    lista.appendChild(li);
    input.value="";
}
*/
//Oggetto Player
const giocatore={
    nome:"Cavalier Pristol",
    hp: 100,
    maxHp: 100,
    arma:{nome: "Spada di Legno", danno:15},
    sprite: "assets/base_knight.png"
}
//Oggeto slime
const nemico = {
    nome: "Slime di Codice",
    hp: 80,
    attacco: 10,
    sprite: "💧"
};
function aggiornaUI(){
    document.getElementById("p-sprite-img").src=giocatore.sprite;
    document.getElementById("p-hp").innerText=giocatore.hp;
    document.getElementById("e-hp").innerText=nemico.hp;
    document.getElementById("p-name").innerText=giocatore.nome;
    document.getElementById("e-name").innerText=nemico.nome;
    document.getElementById("p-weapon").innerText=giocatore.arma.nome;

}
function attaccoGiocatore(){
    if(nemico.hp<=0) return;
    nemico.hp-=giocatore.arma.danno;
    aggiungiLog(`${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${giocatore.arma.danno} HP!`);
    if(nemico.hp>0){
        setTimeout(attaccoNemico,800);
    }
    else{
        nemico.hp=0;
        aggiungiLog("Il nemico è stato sconfitto!")

        aggiornaUI();
    }
}
function attaccoNemico() {
    giocatore.hp -= nemico.attacco;
    aggiungiLog(`${nemico.nome} ti colpisce per ${nemico.attacco} danni!`);
    aggiornaUI();
    
    if (giocatore.hp <= 0) {
        giocatore.hp = 0;
        alert("GAME OVER");
        location.reload();
    }
}
function aggiungiLog(messaggio) {
    const log = document.getElementById("battle-log");
    const li = document.createElement("li");
    li.innerText = messaggio;
    log.insertBefore(li, log.firstChild);
}

// Inizializza l'app
aggiornaUI();