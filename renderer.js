const aspetta = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const db = require('./database.js');
var turnCounter = 1;
var stageCounter=1;
var worldCounter=1;
let giocoInPausa = false;
let ultimoTurnoSpeciale = 0;
const STAGE_PER_MONDO = 4;
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
function displayInfoTurn(){
    const container=document.getElementById("count");
    if (!container) return;
    container.innerHTML=`<div class="info-container">
                            <p>Turno: ${turnCounter} | Stage: ${stageCounter} | Mondo: ${worldCounter}</p>
                        </div>`
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
    datiNemico.maxHp = datiNemico.hp;
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

        cambiaColoreHealthBar(giocatore.hp,giocatore.maxHp, "p-health-bar");
        cambiaColoreHealthBar(nemico.hp,nemico.maxHp, "e-health-bar");
        displayInfoTurn();
        const btnSpeciale = document.getElementById("special-atk-button");
        if (btnSpeciale && giocatore && giocatore.arma) {
            let turniPassati = turnCounter - ultimoTurnoSpeciale;
            let hasAbilita = typeof giocatore.arma.abilita_attiva === "function";

        // Se l'arma ha un'abilità E sono passati almeno 5 turni
            if (hasAbilita && turniPassati >= 5) {
                btnSpeciale.classList.add("special-ready");
    
            } else {
                btnSpeciale.classList.remove("special-ready");
        
            }   
    }
    } catch (error) {
        console.error("Errore durante l'aggiornamento della UI:", error);
    }
}

function cambiaColoreHealthBar(vitaAttuale, vitaMassima, id) {
    var progressBar = document.getElementById(id);
    if (!progressBar) return;

    // 1. Calcoliamo la vera percentuale (da 0 a 100)
    var percentuale = (vitaAttuale / vitaMassima) * 100;
    
    // 2. Limiti di sicurezza (evita che vada sotto lo 0% o sopra il 100%)
    if (percentuale < 0) percentuale = 0;
    if (percentuale > 100) percentuale = 100;

    // 3. Modifichiamo la larghezza
    progressBar.style.width = percentuale + "%";

    // 4. Cambiamo il colore in base alla percentuale calcolata
    if (percentuale > 75) {
        progressBar.style.backgroundColor = "#01ad23"; // Verde scuro
    } else if (percentuale > 50) {
        progressBar.style.backgroundColor = "#80c02b"; // Verde chiaro
    } else if (percentuale > 25) {
        progressBar.style.backgroundColor = "#ffd334"; // Giallo
    } else if (percentuale > 10) {
        progressBar.style.backgroundColor = "#f18030"; // Arancione
    } else {
        progressBar.style.backgroundColor = "#e32f30"; // Rosso
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
    nemico.stato=setStatus(giocatore.arma.tipo);
    let danniStato=checkStatus(giocatore.stato);
    giocatore.hp-=danniStato;
    aggiornaUI();

    if (nemico.hp > 0) {
        gameState.fase = "TURNO_NEMICO";
        await aspetta(1500);
        await turnoNemico();
    } else {
        gameState.fase = "VITTORIA";
        aggiungiLog("🏆 Il nemico è stato sconfitto!");
        await avanzaAlProssimoStage();
    }
}

async function attaccoSpeciale(){
    if (gameState.fase !== "TURNO_GIOCATORE" || nemico.hp <= 0 || giocoInPausa) return;
    
    

    if (typeof giocatore.arma.abilita_attiva !== "function") {
        aggiungiLog(`❌ La tua arma (${giocatore.arma.nome}) non ha un'abilità speciale!`);
        return; // Blocchiamo qui, non fa sprecare il turno
    }
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
        await avanzaAlProssimoStage();
    }
}

async function turnoNemico() {
    while (giocoInPausa) {
        await aspetta(200); // Aspetta 0.2 secondi e poi ricontrolla
    }
    // --- 1. GESTIONE STATI ALTERATI ---
    let dannoDaStato = checkStatus(nemico.stato);
    if (dannoDaStato > 0) {
        nemico.hp -= dannoDaStato;
        if (nemico.hp < 0) nemico.hp = 0;
        
        aggiornaUI();
        await aspetta(1000); // Diamo tempo al giocatore di leggere il log
        
        // IL FIX CRUCIALE: Controlliamo SE È MORTO per via dello stato
        if (nemico.hp <= 0) {
            gameState.fase = "VITTORIA";
            aggiungiLog(`🏆 ${nemico.nome} è stato ridotto in cenere!`);
            await aspetta(1500);
            await avanzaAlProssimoStage();
            return; // IMPORTANTE: questo blocca l'esecuzione del resto del turno nemico!
        }
    }
    
    aggiungiLog(`🎲 ${nemico.nome} si prepara ad attaccare...`);
    await aspetta(1200);

    while (giocoInPausa) {
        await aspetta(200);
    }
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
    let danniStato=checkStatus(nemico.stato);
    nemico.hp-=danniStato;
    aggiornaUI();

    if (giocatore.hp <= 0) {
        gameState.fase = "GAME_OVER";
        await aspetta(1500);
        aggiungiLog("💀 Sei stato sconfitto! Riavvio...");
        setTimeout(mostraGameOver, 1000);
    } else {
        await aspetta(1000);
        while (giocoInPausa) {
            await aspetta(200);
        }
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
    if (giocoInPausa) {
        document.activeElement.blur();
    }
}

function checkStatus(stato) {
    if (!stato) { // check rapido per null, undefined o stringa vuota
        return 0;
    } else if (stato === "burn") {
        aggiungiLog("🔥 Danno da bruciatura!");
        return 8;
    }
    return 0; // Se ha uno stato non riconosciuto, non fa danni
}

function setStatus(tipo){
    if(tipo==="normale"){
        return null;
    }else if(tipo==="fuoco"){
        if(controllaSuccesso(50)){
            aggiungiLog("bruciatura applicata!");
            return "burn";
        }
            
        }else{
            return null;
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
function controllaSuccesso(percentuale) {
    return Math.random() * 100 < percentuale;
}
async function avanzaAlProssimoStage() {
    stageCounter++; // Aumentiamo lo stage
    let turniCaricati = turnCounter - ultimoTurnoSpeciale;
    turnCounter = 1;
    ultimoTurnoSpeciale = 1 - turniCaricati;
    // Controlliamo se abbiamo superato gli stage massimi per questo mondo
    if (stageCounter > STAGE_PER_MONDO) {
        worldCounter++;
        stageCounter = 1; // Resettiamo lo stage per il nuovo mondo
        aggiungiLog(`🌍 BENVENUTO NEL MONDO ${worldCounter}! 🌍`);
        await aspetta(2000);
    } else {
        aggiungiLog(`🚩 Avanzi allo Stage ${stageCounter}...`);
        await aspetta(1500);
    }

    // --- GENERAZIONE NUOVO NEMICO ---
    // Prende tutte le chiavi (i nomi) dei nemici dal tuo database
    const chiaviNemici = Object.keys(db.nemici);
    // Sceglie un nemico a caso
    const nemicoCasuale = chiaviNemici[Math.floor(Math.random() * chiaviNemici.length)];
    
    // Assegna il nuovo nemico
    nemico = { ...db.nemici[nemicoCasuale] };
    nemico.maxHp = nemico.hp; // <-- FONDAMENTALE per non rompere la barra della vita!



    // Ripartiamo!
    gameState.fase = "TURNO_GIOCATORE";
    aggiornaUI();
    aggiungiLog(`⚠️ Un nuovo nemico appare: ${nemico.nome}! È il tuo turno.`);
}
// Inizializza la UI all'avvio
aggiornaUI();