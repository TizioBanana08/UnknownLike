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
    maxHp:80,
    attacco: 10,
    sprite: "💧"
};
//Armi base
//Ogni arma base ha solo abilità passiva condivisa da tutte le armi di quel tipo, le armi normali avranno anche abilità attiva
//Oggetto spada base
const spada={
    atk=15,
    //abilità passiva bleed:ogni attacco aggiungerà 1 di danno 
    abilità_passiva(){
        return danno_aggiuntivo=1;
    },
}

//Oggetto arco base
const arco={
    atk=5,
    //abilità passiva multishot: spara un numero compreso tra 1 e 4 frecce ad attacco
    abilità_passiva(){
        const max = 4;
        const min = 1;
        function generaRandom(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        numeroFreccie = generaRandom(min, max);
        return numeroFreccie*this.atk;
    },
}



function aggiornaUI(){
    let percentualeVitaP = (giocatore.hp / giocatore.maxHp) * 100;
    let percentualeVitaE = (nemico.hp / nemico.maxHp) * 100;
    document.getElementById("p-sprite-img").src=giocatore.sprite;
    document.getElementById("p-hp").innerText=giocatore.hp;
    document.getElementById("e-hp").innerText=nemico.hp;
    document.getElementById("p-name").innerText=giocatore.nome;
    document.getElementById("e-name").innerText=nemico.nome;
    document.getElementById("p-weapon").innerText=giocatore.arma.nome;
    cambiaColoreHealthBar(percentualeVitaP,"p-health-bar");
    cambiaColoreHealthBar(percentualeVitaE,"e-health-bar");
}
function cambiaColoreHealthBar(vitaP,id){
    var progressBar=document.getElementById(id);
    progressBar.style.width=vitaP+"%";
    if(vitaP>75){
        progressBar.style.backgroundColor="#01ad23"
    }
    if(vitaP<=75 && vitaP>50){
        progressBar.style.backgroundColor="#80c02b"
    }
    if(vitaP<=50 && vitaP>25){
        progressBar.style.backgroundColor="#ffd334"
    }
    if(vitaP<=25 && vitaP>10){
        progressBar.style.backgroundColor="#f18030"
    }
    if(vitaP<=10){
        progressBar.style.backgroundColor="#e32f30"
    }
}
function attaccoGiocatore(){
    if(nemico.hp<=0) return;
    nemico.hp-=giocatore.arma.danno;
    aggiungiLog(`${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${giocatore.arma.danno} HP!`);
    if(nemico.hp>0){
        setTimeout(attaccoNemico(),800);
    }
    else{
        nemico.hp=0;
        aggiungiLog("Il nemico e' stato sconfitto!")
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