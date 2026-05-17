const aspetta = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const db = require('./database.js');

let gameState = {
    fase: "TURNO_GIOCATORE", // Può essere: TURNO_GIOCATORE, TURNO_NEMICO, VITTORIA, GAME_OVER
    animazioneInCorso: false
};
//Oggetto Player
const giocatore=db.personaggi.cavaliere;
if (typeof giocatore.arma === 'string') {
    giocatore.arma = db.armi[giocatore.arma];
}
//Oggeto nemico
function generaNemico(){
    const chiaviNemici=Object.keys(db.nemici);
    const chiaveCasuale=chiaviNemici[Math.floor(Math.random()*chiaviNemici.length)];
    const datiNemico=db.nemici[chiaveCasuale];
    return datiNemico;
}
var nemico = generaNemico(); 
function aggiornaUI(){
    let percentualeVitaP = (giocatore.hp / giocatore.maxHp) * 100;
    let percentualeVitaE = (nemico.hp / nemico.maxHp) * 100;
    document.getElementById("p-sprite-img").src=giocatore.sprite;
    document.getElementById("e-sprite-img").src=nemico.sprite;
    document.getElementById("p-hp").innerText=giocatore.hp;
    document.getElementById("e-hp").innerText=nemico.hp;
    document.getElementById("p-name").innerText=giocatore.nome;
    document.getElementById("e-name").innerText=nemico.nome;
    document.getElementById("p-weapon").innerText=giocatore.arma.nome;
    document.getElementById("e-atk").innerText=nemico.attacco;
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
async function attaccoGiocatore() {
    if (gameState.fase !== "TURNO_GIOCATORE" || nemico.hp <= 0) return;
    let dannoTurno=0;
    if (typeof giocatore.arma.abilita_passiva === "function") {
        dannoTurno = giocatore.arma.abilita_passiva();
    } else {
        dannoTurno = giocatore.arma.atk;
    }
    if(giocatore.arma.nome==="Spada"){
        dannoTurno=giocatore.arma.atk+1;
    }
    if(giocatore.arma.nome==="Lancia"){
        dannoTurno=giocatore.arma.atk+dannoTurno;
    }
    nemico.hp -= dannoTurno;
    if (nemico.hp < 0) nemico.hp = 0;
    
    // 2. Aggiorna UI subito per far vedere la barra che scende
    aggiornaUI();

    if (dannoTurno > giocatore.arma.atk) {
        aggiungiLog(`✨ Effetto attivato! Danno totale: ${dannoTurno} HP`);
        aggiungiLog(`⚔️ ${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${dannoTurno} HP!`);
    } else {
        aggiungiLog(`⚔️ ${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${dannoTurno} HP!`);
    }

    if (nemico.hp > 0) {
        gameState.fase = "TURNO_NEMICO";
        // Aspettiamo un po' prima che il nemico reagisca
        await aspetta(1500);
        await turnoNemico();
    } else {
        gameState.fase = "VITTORIA";
        aggiungiLog("🏆 Il nemico è stato sconfitto!");
    }
}
function turnoNemico(){
    if(gameState!=="TURNO_NEMICO") return;
    setTimeout(attaccoNemico(),1500);
}
async function turnoNemico() {
    // Non serve setTimeout, usiamo await aspetta
    aggiungiLog(`🎲 ${nemico.nome} si prepara ad attaccare...`);
    await aspetta(1200);

    giocatore.hp -= nemico.attacco;
    if (giocatore.hp < 0) giocatore.hp = 0;
    
    aggiornaUI();
    aggiungiLog(`💥 ${nemico.nome} ti colpisce per ${nemico.attacco} danni!`);

    if (giocatore.hp <= 0) {
        gameState.fase = "GAME_OVER";
        await aspetta(1500);
        aggiungiLog("💀 Sei stato sconfitto! Riavvio...");
        await aspetta(2000);
        location.reload();
    } else {
        await aspetta(1000);
        gameState.fase = "TURNO_GIOCATORE";
        aggiungiLog("🛡️ È il tuo turno!");
    }
}
function aggiungiLog(messaggio) {
    const log = document.getElementById("battle-log");
    const li = document.createElement("li");
    li.innerText = messaggio;
    log.insertBefore(li, log.firstChild);
    log.scrollBottom = log.scrollHeight;
}

// Inizializza l'app
aggiornaUI();