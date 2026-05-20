const aspetta = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const db = require('./database.js');
var turnCounter = 1;
let giocoInPausa = false;
let ultimoTurnoSpeciale = 0;
// --- GESTIONE MENU E SCELTA ARMI ---

function startGame() {
    const menu = document.getElementById("main-menu");
    menu.style.opacity = "0";

        menu.classList.add("hidden");
        
        // Chiamiamo la funzione che pesca le armi (ora definita sotto)
        preparaSceltaStarter(); 
        
        const weaponScreen = document.getElementById("weapon-selection-screen");
        weaponScreen.classList.remove("hidden");
        weaponScreen.classList.add("visible");

}

// Questa è la funzione che mancava o aveva il nome sbagliato
function preparaSceltaStarter() {
    const tutteLeChiavi = Object.keys(db.armi);
    const armiComuni = tutteLeChiavi.filter(chiave => db.armi[chiave].rarita === "comune");

    let scelte = [];
    let copiaComuni = [...armiComuni];
    
    for (let i = 0; i < 3; i++) {
        if (copiaComuni.length > 0) {
            let indice = Math.floor(Math.random() * copiaComuni.length);
            scelte.push(copiaComuni.splice(indice, 1)[0]);
        }
    }

    const container = document.querySelector(".weapons-container");
    container.innerHTML = ""; 

    scelte.forEach(chiave => {
        const arma = db.armi[chiave];
        container.innerHTML += `
            <div class="weapon-card">
                <h3>${arma.nome}</h3>
                <img src="${arma.sprite}" alt="${arma.nome}">
                <p>${arma.descrizione}</p>
                <button onclick="selezionaStarter('${chiave}')">SCEGLI</button>
            </div>
        `;
    });
}

function selezionaStarter(chiaveArma) {
    console.log("Arma scelta:", chiaveArma);
    giocatore.arma = db.armi[chiaveArma];

    const weaponScreen = document.getElementById("weapon-selection-screen");
    const mainContainer = document.getElementById("main-container");
    const mainMenu = document.getElementById("main-menu");

    // Nascondi i menu
    if (weaponScreen) {
        weaponScreen.classList.add("hidden");
        weaponScreen.style.setProperty("display", "none", "important");
    }
    if (mainMenu) mainMenu.style.display = "none";

    // MOSTRA IL GIOCO
    if (mainContainer) {
        mainContainer.classList.remove("hidden");
        mainContainer.classList.add("active");
        
        // Forza il display via JS per sicurezza massima
        mainContainer.style.setProperty("display", "flex", "important");
        
        console.log("Gioco mostrato correttamente");
    }

    aggiornaUI();
    aggiungiLog(`🗡️ Hai scelto ${giocatore.arma.nome}!`);
    gameState.fase = "TURNO_GIOCATORE";
}
// --- STATO DEL GIOCO E INIZIALIZZAZIONE ---

let gameState = {
    fase: "TURNO_GIOCATORE", // Può essere: TURNO_GIOCATORE, TURNO_NEMICO, VITTORIA, GAME_OVER
    animazioneInCorso: false
};

// Oggetto Player
const giocatore = db.personaggi.cavaliere;
giocatore.arma = null;
if (typeof giocatore.armatura === 'string') {
    giocatore.armatura = db.armature[giocatore.armatura];
    giocatore.maxHp = giocatore.maxHp + giocatore.armatura.difesa;
    giocatore.hp = giocatore.hp + giocatore.armatura.difesa;
}

// Oggetto nemico
function generaNemico(){
    const chiaviNemici = Object.keys(db.nemici);
    const chiaveCasuale = chiaviNemici[Math.floor(Math.random() * chiaviNemici.length)];
    const datiNemico = db.nemici[chiaveCasuale];
    return datiNemico;
}
var nemico = generaNemico(); 

// --- INTERFACCIA (UI) ---

function aggiornaUI() {
    // 1. Controllo di sicurezza estremo
    if (!giocatore || !giocatore.arma || !nemico) {
        console.warn("AggiornaUI interrotta: dati non ancora pronti.");
        return;
    }

    try {
        let percentualeVitaP = (giocatore.hp / giocatore.maxHp) * 100;
        let percentualeVitaE = (nemico.hp / nemico.maxHp) * 100;

        document.getElementById("p-sprite-img").src = giocatore.sprite;
        document.getElementById("e-sprite-img").src = nemico.sprite;
        document.getElementById("weapon-sprite-img").src = giocatore.arma.sprite;
        document.getElementById("armor-sprite-img").src = giocatore.armatura.sprite;
        
        document.getElementById("p-hp").innerText = giocatore.hp;
        document.getElementById("e-hp").innerText = nemico.hp;
        document.getElementById("p-name").innerText = giocatore.nome;
        document.getElementById("e-name").innerText = nemico.nome;
        document.getElementById("p-weapon").innerText = giocatore.arma.nome;
        document.getElementById("e-atk").innerText = nemico.attacco;

        cambiaColoreHealthBar(percentualeVitaP, "p-health-bar");
        cambiaColoreHealthBar(percentualeVitaE, "e-health-bar");
    } catch (error) {
        console.error("Errore durante l'aggiornamento della UI:", error);
    }
}

function cambiaColoreHealthBar(vitaP, id){
    var progressBar = document.getElementById(id);
    progressBar.style.width = vitaP + "%";
    if(vitaP > 75){
        progressBar.style.backgroundColor = "#01ad23";
    } else if(vitaP <= 75 && vitaP > 50){
        progressBar.style.backgroundColor = "#80c02b";
    } else if(vitaP <= 50 && vitaP > 25){
        progressBar.style.backgroundColor = "#ffd334";
    } else if(vitaP <= 25 && vitaP > 10){
        progressBar.style.backgroundColor = "#f18030";
    } else if(vitaP <= 10){
        progressBar.style.backgroundColor = "#e32f30";
    }
}
// --- LOGICA DI COMBATTIMENTO ---

async function attaccoGiocatore() {
    if (gameState.fase !== "TURNO_GIOCATORE" || nemico.hp <= 0 || giocoInPausa) return;
    
    let dannoTurno = 0;
    if (typeof giocatore.arma.abilita_passiva === "function") {
        dannoTurno = giocatore.arma.abilita_passiva();
    } else {
        dannoTurno = giocatore.arma.atk;
    }
    if(giocatore.arma.nome==="Spada"){
        dannoTurno=giocatore.arma.atk+1;
    }
    if(giocatore.arma.nome === "Lancia"){
        dannoTurno = giocatore.arma.atk + dannoTurno;
    }
    
    nemico.hp -= dannoTurno;
    if (nemico.hp < 0) nemico.hp = 0;
    
    // Aggiorna UI subito per far vedere la barra che scende
    aggiornaUI();

    if (dannoTurno > giocatore.arma.atk) {
        turnCounter += 1;
        aggiungiLog(`✨ Effetto attivato! Danno totale: ${dannoTurno} HP`);
        aggiungiLog(`⚔️ ${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${dannoTurno} HP!`);
    } else {
        turnCounter += 1;
        aggiungiLog(`⚔️ ${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${dannoTurno} HP!`);
    }

    if (nemico.hp > 0) {
        gameState.fase = "TURNO_NEMICO";
        await aspetta(1500);
        await turnoNemico();
    } else {
        gameState.fase = "VITTORIA";
        aggiungiLog("🏆 Il nemico è stato sconfitto!");
    }
}

async function attaccoSpeciale(){
    if (gameState.fase !== "TURNO_GIOCATORE" || nemico.hp <= 0 || giocoInPausa) return;
    
    let dannoTurno = 0;
    
    // Calcoliamo quanti turni sono passati dall'ultimo utilizzo (o dall'inizio del gioco)
    let turniPassati = turnCounter - ultimoTurnoSpeciale;
    
    // INVECE DEL MODULO % 5, CONTROLLIAMO SE SONO PASSATI ALMENO 5 TURNI
    if (typeof giocatore.arma.abilita_attiva === "function" && turniPassati >= 5) {
        dannoTurno = giocatore.arma.abilita_attiva();
        
        // Aggiorniamo il contatore: l'abbiamo appena usata in questo turno!
        ultimoTurnoSpeciale = turnCounter; 
    } else {
        dannoTurno = giocatore.arma.atk;
    }
    
    nemico.hp -= dannoTurno;
    if (nemico.hp < 0) nemico.hp = 0;
    
    aggiornaUI();
    
    if (dannoTurno > giocatore.arma.atk) {
        aggiungiLog(`✨ Attacco speciale attivato! Danno totale: ${dannoTurno} HP`);
        aggiungiLog(`⚔️ ${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${dannoTurno} HP!`);
        turnCounter += 1;
    } else {
        // Calcolo corretto dei turni mancanti
        let turniMancanti = 5 - turniPassati;
        aggiungiLog(`❌ Impossibile usare l'abilità speciale, aspetta ${turniMancanti} turni. Attacco base lanciato!`);
        aggiungiLog(`⚔️ ${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${dannoTurno} HP!`);
        turnCounter += 1;
    }
    
    if (nemico.hp > 0) {
        gameState.fase = "TURNO_NEMICO";
        await aspetta(1500);
        await turnoNemico();
    } else {
        gameState.fase = "VITTORIA";
        aggiungiLog("🏆 Il nemico è stato sconfitto!");
    }
}

async function turnoNemico() {
    if(giocoInPausa) return;
    
    aggiungiLog(`🎲 ${nemico.nome} si prepara ad attaccare...`);
    await aspetta(1200);
    
    let dannoTurnoNemico = nemico.attacco;
    dannoTurnoNemico -= giocatore.armatura.difesa;
    
    if (typeof giocatore.armatura.abilita_passiva === "function") {
        dannoTurnoNemico -= giocatore.armatura.abilita_passiva();
    }
    
    if(dannoTurnoNemico < 0) dannoTurnoNemico = 0;
    
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

// --- GESTIONE SCHERMATE E MENU ---

function mostraGameOver(){
    const screen = document.getElementById("game-over-screen");
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
    
    // Aggiunge in fondo alla lista
    log.appendChild(li);
    
    // Autoscroll verso il basso per vedere l'ultimo messaggio
    log.scrollTop = log.scrollHeight;
}

function toggleOptions() {
    const menu = document.getElementById("options-menu");
    if (!menu) {
        console.error("Errore: Il div options-menu non esiste nell'HTML!");
        return;
    }
    menu.classList.toggle("visible");
    giocoInPausa = menu.classList.contains("visible");
}

function checkStatus(){
    if(giocatore.stato==null){
        giocatore.hp=giocatore.hp;
    }else if(giocatore.stato=="burn"){
        giocatore.hp-=3;
    }
}
// --- EVENT LISTENERS E DESCRITTORI OGGETTI ---

const weaponImg = document.getElementById("weapon-sprite-img");
const armorImg = document.getElementById("armor-sprite-img");
const descBox = document.getElementById("item-description");

weaponImg.onclick = () => {
    const descName = document.getElementById("desc-name");
    const descText = document.getElementById("desc-text");
    const arma = giocatore.arma;

    descName.innerText = arma.nome;
    descText.innerText = arma.descrizione;
    descBox.classList.toggle("hidden");
};

armorImg.onclick = () => {
    const descName = document.getElementById("desc-name");
    const descText = document.getElementById("desc-text");
    const armatura = giocatore.armatura;

    descName.innerText = armatura.nome;
    descText.innerText = armatura.descrizione;
    descBox.classList.toggle("hidden");
};

window.onclick = (event) => {
    if (event.target !== weaponImg && !descBox.contains(event.target) && event.target !== armorImg) {
        descBox.classList.add("hidden");
    }
};

window.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        toggleOptions();
    }
});

// Inizializza la UI all'avvio
aggiornaUI();