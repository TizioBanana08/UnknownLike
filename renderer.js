const aspetta = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const db = require('./database.js');
function startGame() {
    const menu = document.getElementById("main-menu");
    menu.style.transition = "opacity 0.5s";
    menu.style.opacity = "0";
    
    setTimeout(() => {
        menu.classList.add("hidden"); // Lo nascondi del tutto dopo l'animazione
    }, 500);
}
let gameState = {
    fase: "TURNO_GIOCATORE", // Può essere: TURNO_GIOCATORE, TURNO_NEMICO, VITTORIA, GAME_OVER
    animazioneInCorso: false
};
//Oggetto Player
const giocatore=db.personaggi.cavaliere;
if (typeof giocatore.arma === 'string') {
    giocatore.arma = db.armi[giocatore.arma];
}
if (typeof giocatore.armatura === 'string') {
    giocatore.armatura = db.armature[giocatore.armatura];
    giocatore.maxHp=giocatore.maxHp+giocatore.armatura.difesa;
    giocatore.hp=giocatore.hp+giocatore.armatura.difesa;
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
    document.getElementById("weapon-sprite-img").src=giocatore.arma.sprite;
    document.getElementById("armor-sprite-img").src=giocatore.armatura.sprite;
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
    let dannoTurnoNemico=nemico.attacco;
    if (typeof giocatore.armatura.abilita_passiva === "function") {
        dannoTurnoNemico = giocatore.armatura.abilita_passiva();
    } else {
        dannoTurnoNemico = nemico.attacco;
    }
    if(giocatore.armatura.nome==="Armatura di maglia"){
        dannoTurnoNemico=dannoTurnoNemico;
    }
    if(giocatore.armatura.nome==="Armatura di ferro"){
        dannoTurnoNemico-=5;
    }
    giocatore.hp -= dannoTurnoNemico;
    if (giocatore.hp < 0) giocatore.hp = 0;
    
    aggiornaUI();
    aggiungiLog(`💥 ${nemico.nome} ti colpisce per ${dannoTurnoNemico} danni!`);

    if (giocatore.hp <= 0) {
        gameState.fase = "GAME_OVER";
        await aspetta(1500);
        aggiungiLog("💀 Sei stato sconfitto! Riavvio...");
        setTimeout(mostraGameOver, 1000);
    } else {
        await aspetta(1000);
        gameState.fase = "TURNO_GIOCATORE";
        aggiungiLog("🛡️ È il tuo turno!");
    }
}
function mostraGameOver(){
    const screen=document.getElementById("game-over-screen");
    screen.classList.remove("hidden");
}
function restartGame(){
    location.reload();
}
function quitGame(){
    window.close();
}
function aggiungiLog(messaggio) {
    const log = document.getElementById("battle-log");
    const li = document.createElement("li");
    li.innerText = messaggio;
    log.insertBefore(li, log.firstChild);
    log.scrollBottom = log.scrollHeight;
}
const weaponImg = document.getElementById("weapon-sprite-img");
const armorImg=document.getElementById("armor-sprite-img");
const descBox = document.getElementById("item-description");
weaponImg.onclick = () => {
    const descName = document.getElementById("desc-name");
    const descText = document.getElementById("desc-text");
    // Prendiamo l'arma corrente del giocatore
    const arma = giocatore.arma;

    // Riempiamo il box
    descName.innerText = arma.nome;
    
    descText.innerText=arma.descrizione;

    // Mostriamo il box (se era nascosto, lo mostra; se era visibile, lo nasconde)
    descBox.classList.toggle("hidden");
};
armorImg.onclick=()=>{
    const descName = document.getElementById("desc-name");
    const descText = document.getElementById("desc-text");
    // Prendiamo l'arma corrente del giocatore
    const armatura = giocatore.armatura;

    // Riempiamo il box
    descName.innerText = armatura.nome;
    
    descText.innerText=armatura.descrizione;

    // Mostriamo il box (se era nascosto, lo mostra; se era visibile, lo nasconde)
    descBox.classList.toggle("hidden");
}
window.onclick = (event) => {
    if (event.target !== weaponImg && !descBox.contains(event.target)&&event.target !== armorImg) {
        descBox.classList.add("hidden");
    }
};
// Inizializza l'app
aggiornaUI();