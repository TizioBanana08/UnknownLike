const aspetta = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const db = require('./database.js');
console.log("Dati caricati dal database:", db);
var turnCounter = 1;
var stageCounter=1;
var worldCounter=1;
let giocoInPausa = false;
let ultimoTurnoSpeciale = 0;
const STAGE_PER_MONDO = 4;
const databaseCure=db.consumabili;
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
giocatore.inventario = [
    { id: "pozione_base", quantita: 2 },
    { id: "pane", quantita: 5 }
];
if (typeof giocatore.armatura === 'string') {
    giocatore.armatura = db.armature[giocatore.armatura];
    giocatore.maxHp = giocatore.maxHp + giocatore.armatura.difesa;
    giocatore.hp = giocatore.hp + giocatore.armatura.difesa;
}

// Oggetto nemico
function generaNemico(){
    const chiaviNemici = Object.keys(db.nemici);
    const chiaveCasuale = chiaviNemici[Math.floor(Math.random() * chiaviNemici.length)];
    const datiNemico = {...db.nemici[chiaveCasuale]};
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
        if(giocatore.armatura===null){
            document.getElementById("armor-sprite-img").src="assets/other/no_item.png";
        }
        else{
            document.getElementById("armor-sprite-img").src=giocatore.armatura.sprite;
        }
         
        
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
    // 1. Controllo di sicurezza
    if (gameState.fase !== "TURNO_GIOCATORE" || nemico.hp <= 0 || giocoInPausa || gameState.animazioneInCorso) return;
    
    gameState.animazioneInCorso = true; // 🔒 CHIUDIAMO IL LUCCHETTO

    try {
        // Calcolo base del danno dell'arma
        let dannoTurno = 0;
        if (typeof giocatore.arma.abilita_passiva === "function") {
            dannoTurno = giocatore.arma.abilita_passiva();
        } else {
            dannoTurno = giocatore.arma.atk; // Assicurati che non si chiami 'danno' nel tuo db armi
        }

        // ⚠️ Questi if andrebbero rimossi in futuro gestendo tutto tramite il database delle armi!
        if (giocatore.arma.nome === "Spada") {
            dannoTurno = giocatore.arma.atk + 1;
        }
        if (giocatore.arma.nome === "Lancia") {
            dannoTurno = giocatore.arma.atk + dannoTurno;
        }

        // --- INIZIO SISTEMA DATA-DRIVEN PER I PASSIVI ---
        let moltiplicatore = 1;
        let dannoBonusFisso = 0;

        giocatore.passivi.forEach(idPassivo => {
            const oggetto = db.passivi[idPassivo];
            
            if (oggetto) {
                // Cura
                if (oggetto.tipoEffetto === "cura_inizio_turno") {
                    giocatore.hp = Math.min(giocatore.maxHp, giocatore.hp + oggetto.valore);
                    aggiungiLog(`✨ ${oggetto.nome} si attiva: +${oggetto.valore} HP!`);
                }
                // Potenziamento Attacco (% percentuale)
                if (oggetto.tipoEffetto === "moltiplicatore_danno") {
                    moltiplicatore *= oggetto.valore;
                }
                // Danno extra fisso
                if (oggetto.tipoEffetto === "danno_piatto") {
                    dannoBonusFisso += oggetto.valore;
                }
            }
        });

        // Applichiamo i bonus passivi al danno finale
        dannoTurno = Math.floor((dannoTurno + dannoBonusFisso) * moltiplicatore);
        // --- FINE SISTEMA PASSIVI ---

        // Infliggiamo il danno al nemico
        nemico.hp -= dannoTurno;
        if (nemico.hp < 0) nemico.hp = 0;
        
        aggiornaUI();

        // Log e contatori
        if (dannoTurno > giocatore.arma.atk) {
            turnCounter += 1;
            aggiungiLog(`✨ Effetto attivato! Danno totale: ${dannoTurno} HP`);
        } else {
            turnCounter += 1;
        }
        aggiungiLog(`⚔️ ${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${dannoTurno} HP!`);

        // Gestione sicura dello status
        if (giocatore.arma.tipo) {
            nemico.stato = setStatus(giocatore.arma.tipo);
        }
        
        // Danni da stato sul giocatore
        if (giocatore.stato) {
            let danniStato = checkStatus(giocatore.stato);
            if (danniStato > 0) {
                giocatore.hp -= danniStato;
                aggiungiLog(`🔥 Subisci danni dal tuo stato!`);
            }
        }
        aggiornaUI();

        // 2. Passaggio del turno
        if (nemico.hp > 0) {
            gameState.fase = "TURNO_NEMICO";
            await aspetta(1500);
            await turnoNemico(); 
        } else {
            gameState.fase = "VITTORIA";
            aggiungiLog("🏆 Il nemico è stato sconfitto!");
            await avanzaAlProssimoStage(); 
        }

    } catch (errore) {
        // 🚨 SBLOCCO DI EMERGENZA
        console.error("Errore critico durante l'attacco:", errore);
        gameState.animazioneInCorso = false; 
        gameState.fase = "TURNO_GIOCATORE";
        aggiungiLog("❌ Errore interno, ma i tasti sono stati sbloccati.");
    }
}

async function attaccoSpeciale() {
    if (gameState.fase !== "TURNO_GIOCATORE" || nemico.hp <= 0 || giocoInPausa || gameState.animazioneInCorso) return;
    
    if (typeof giocatore.arma.abilita_attiva !== "function") {
        aggiungiLog(`❌ La tua arma (${giocatore.arma.nome}) non ha un'abilità speciale!`);
        return; 
    }
    
    gameState.animazioneInCorso = true; // 🔒

    try {
        let dannoTurno = 0;
        let turniPassati = turnCounter - ultimoTurnoSpeciale;
        
        // Calcola il danno base prima dei modificatori
        if (turniPassati >= 5) {
            dannoTurno = giocatore.arma.abilita_attiva();
            ultimoTurnoSpeciale = turnCounter; 
            aggiungiLog(`✨ Attacco speciale attivato!`);
        } else {
            let turniMancanti = 5 - turniPassati;
            dannoTurno = giocatore.arma.atk;
            aggiungiLog(`❌ Abilità scarica (aspetta ${turniMancanti} turni). Lanciato attacco base!`);
        }

        // --- INIZIO SISTEMA DATA-DRIVEN PER I PASSIVI ---
        let moltiplicatore = 1;
        let dannoBonusFisso = 0;

        giocatore.passivi.forEach(idPassivo => {
            const oggetto = db.passivi[idPassivo]; // Recupera dal database usando la chiave
            
            if (oggetto) {
                // Cura
                if (oggetto.tipoEffetto === "cura_inizio_turno") {
                    giocatore.hp = Math.min(giocatore.maxHp, giocatore.hp + oggetto.valore);
                    aggiungiLog(`✨ ${oggetto.nome} si attiva: +${oggetto.valore} HP!`);
                }
                // Potenziamento Attacco (% percentuale)
                if (oggetto.tipoEffetto === "moltiplicatore_danno") {
                    moltiplicatore *= oggetto.valore;
                }
                // Danno extra fisso
                if (oggetto.tipoEffetto === "danno_piatto") {
                    dannoBonusFisso += oggetto.valore;
                }
            }
        });

        // Applichiamo i bonus passivi al danno finale dell'attacco speciale
        dannoTurno = Math.floor((dannoTurno + dannoBonusFisso) * moltiplicatore);
        // --- FINE SISTEMA PASSIVI ---
        
        nemico.hp -= dannoTurno;
        if (nemico.hp < 0) nemico.hp = 0;
        aggiungiLog(`⚔️ ${giocatore.nome} usa ${giocatore.arma.nome} e toglie ${dannoTurno} HP!`);
        turnCounter += 1;
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

    } catch (errore) {
        console.error("Errore critico durante l'attacco speciale:", errore);
        gameState.animazioneInCorso = false; 
        gameState.fase = "TURNO_GIOCATORE";
        aggiungiLog("❌ Errore interno, ma i tasti sono stati sbloccati.");
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
    if(giocatore.armatura!==null){      
        dannoTurnoNemico -= giocatore.armatura.difesa;
    }
    
    
    if (giocatore.armatura!==null && typeof giocatore.armatura.abilita_passiva === "function") {
        dannoTurnoNemico -= giocatore.armatura.abilita_passiva();
    }
    
    if(dannoTurnoNemico < 0) dannoTurnoNemico = 0;
    
    giocatore.hp -= dannoTurnoNemico;
    if (giocatore.hp < 0) giocatore.hp = 0;
    
    aggiornaUI();
    aggiungiLog(`💥 ${nemico.nome} ti colpisce per ${dannoTurnoNemico} danni!`);
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
        gameState.animazioneInCorso = false;
        aggiungiLog("🛡️ È il tuo turno!");
    }
}

// --- GESTIONE SCHERMATE E MENU ---

function mostraGameOver(){
    const screen = document.getElementById("game-over-screen");
    screen.classList.remove("hidden");
}

function restartGame() {
    // 1. Resettiamo le variabili globali
    turnCounter = 1;
    stageCounter = 1;
    worldCounter = 1;
    ultimoTurnoSpeciale = 0;
    giocoInPausa = false;
    gameState.fase = "TURNO_GIOCATORE";
    gameState.animazioneInCorso = false;

    // 2. Resettiamo la vita del giocatore al massimo
    giocatore.hp = giocatore.maxHp;
    giocatore.arma = null;
    if (giocatore.stato) giocatore.stato = null; // Se avevi implementato gli stati sul giocatore

    // 3. Generiamo un nuovo nemico iniziale
    nemico = generaNemico();

    // 4. Puliamo il log della battaglia
    const log = document.getElementById("battle-log");
    if (log) log.innerHTML = ""; 

    // 5. Gestione delle schermate UI
    const gameOverScreen = document.getElementById("game-over-screen");
    const mainContainer = document.getElementById("main-container");
    const weaponScreen = document.getElementById("weapon-selection-screen");

    // Nascondiamo il Game Over e il Campo di Battaglia
    if (gameOverScreen) gameOverScreen.classList.add("hidden");
    if (mainContainer) {
        mainContainer.classList.add("hidden");
        mainContainer.style.setProperty("display", "none", "important");
    }

    // Preparo le nuove armi
    preparaSceltaStarter();

    // Mostriamo la schermata delle armi
    if (weaponScreen) {
        weaponScreen.classList.remove("hidden");
        weaponScreen.classList.add("visible");
        // Se nel tuo CSS usi display: flex per centrare le carte, mettilo qui:
        weaponScreen.style.setProperty("display", "flex", "important"); 
    }
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
    if (gameState.animazioneInCorso && !giocoInPausa) {
        // Se l'animazione è in corso ma NON è per via della pausa, 
        // significa che c'è un baule o un attacco: blocca tutto.
        return; 
    }
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
    if(giocatore.armatura===null){
        const descName = document.getElementById("desc-name");
        const descText = document.getElementById("desc-text");
        const armatura = giocatore.armatura;

        descName.innerText = armatura.nome;
        descText.innerText = armatura.descrizione;
        descBox.classList.toggle("hidden");
    }
    
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
    stageCounter++; 
    let turniCaricati = turnCounter - ultimoTurnoSpeciale;
    turnCounter = 1;
    ultimoTurnoSpeciale = 1 - turniCaricati;
    
    // Controlliamo se abbiamo finito il mondo
    if (stageCounter > STAGE_PER_MONDO) {
        apriChest(); // Apre la schermata e mette animazioneInCorso = true
        return;      // 🛑 FONDAMENTALE: Ferma l'esecuzione qui! Non va oltre.
    } 
        
    // --- SE NON C'È LA CHEST (Avanzamento normale) ---
    aggiungiLog(`🚩 Avanzi allo Stage ${stageCounter}...`);
    await aspetta(1500);

    // Generazione nuovo nemico normale
    nemico = generaNemico(); 

    // Ripartiamo
    gameState.fase = "TURNO_GIOCATORE";
    gameState.animazioneInCorso = false; // Riapre i tasti
    aggiornaUI();
    aggiungiLog(`⚠️ Un nuovo nemico appare: ${nemico.nome}! È il tuo turno.`);
}
async function usaDalInventario(index) {
    if (gameState.fase !== "TURNO_GIOCATORE" || gameState.animazioneInCorso) return;

    const slot = giocatore.inventario[index];
    if (!slot || slot.quantita <= 0) return;

    const datiOggetto = db.consumabili[slot.id];

    // Controllo vita massima
    if (giocatore.hp >= giocatore.maxHp) {
        aggiungiLog("✨ Sei già al massimo della forma!");
        return;
    }

    gameState.animazioneInCorso = true;

    // Applichiamo la cura
    giocatore.hp += datiOggetto.valore;
    if (giocatore.hp > giocatore.maxHp) giocatore.hp = giocatore.maxHp;

    // Riduciamo la quantità o rimuoviamo l'oggetto
    slot.quantita -= 1;
    if (slot.quantita <= 0) {
        giocatore.inventario.splice(index, 1); // Rimuove lo slot se vuoto
    }

    aggiungiLog(`🧪 Hai usato ${datiOggetto.nome}! +${datiOggetto.valore} HP.`);
    
    aggiornaUI();
    // Il tasto cura ora chiude anche il menu inventario se lo hai aperto
    // toggleInventario(); 

    // Passaggio turno
    gameState.fase = "TURNO_NEMICO";
    await aspetta(1500);
    await turnoNemico();
}
// Sostituisci la tua vecchia funzione cura() con questa
function cura() {
    if (gameState.fase !== "TURNO_GIOCATORE" || gameState.animazioneInCorso) return;
    toggleZaino();
}

function toggleZaino() {
    const screen = document.getElementById("inventory-screen");
    if (screen.classList.contains("visible") || gameState.animazioneInCorso) return;
    screen.classList.toggle("visible"); // Uso .visible come nel tuo CSS per la scelta armi

    if (screen.classList.contains("visible")) {
        mostraOggettiZaino();
    }
}

function mostraOggettiZaino() {
    const container = document.getElementById("inventory-list");
    console.log("Tentativo di mostrare lo zaino..."); // LOG 1
    
    if (!container) {
        console.error("ERRORE: Non trovo l'elemento inventory-list nell'HTML!");
        return;
    }

    container.innerHTML = ""; 

    console.log("Contenuto inventario:", giocatore.inventario); // LOG 2

    if (giocatore.inventario.length === 0) {
        container.innerHTML = "<h2 style='color:white;'>Zaino Vuoto</h2>";
        return;
    }

    giocatore.inventario.forEach((slot, index) => {
        const datiOggetto = databaseCure[slot.id];
        console.log("Sto creando la card per:", datiOggetto.nome); // LOG 3
        
        container.innerHTML += `
            <div class="weapon-card">
                <h3>${datiOggetto.nome}</h3>
                <p>Quantità: <strong>${slot.quantita}</strong></p>
                <img src="${datiOggetto.sprite}" alt="${datiOggetto.nome}" style="width:80px; height:80px;">
                <p>${datiOggetto.descrizione}</p>
                <button onclick="usaCura(${index})">USA</button>
            </div>
        `;
    });
}
async function usaCura(index) {
    // 1. Controlli di sicurezza
    if (gameState.fase !== "TURNO_GIOCATORE" || gameState.animazioneInCorso) return;

    const slot = giocatore.inventario[index];
    const dati = databaseCure[slot.id]; // (Assicurati che corrisponda al tuo database, magari è db.consumabili)

    if (giocatore.hp >= giocatore.maxHp) {
        aggiungiLog("✨ La tua salute è già al massimo!");
        return;
    }

    // 2. Esecuzione Cura
    gameState.animazioneInCorso = true; // Blocca i click temporaneamente
    toggleZaino(); // Chiude lo schermo dello zaino

    giocatore.hp += dati.cura;
    if (giocatore.hp > giocatore.maxHp) giocatore.hp = giocatore.maxHp;

    // Riduciamo la quantità o rimuoviamo lo slot
    slot.quantita -= 1;
    if (slot.quantita <= 0) {
        giocatore.inventario.splice(index, 1);
    }

    aggiungiLog(`🧪 Hai usato ${dati.nome} e recuperato ${dati.cura} HP! (Azione rapida)`);
    aggiornaUI(); // Aggiorna le barre della vita a schermo

    // 3. MANTIENI IL TURNO
    await aspetta(500); // Piccola pausa giusto per far leggere il messaggio a schermo
    
    // Riapriamo il lucchetto! La fase è ancora "TURNO_GIOCATORE", quindi ora puoi cliccare "Attacca"
    gameState.animazioneInCorso = false; 
}
function calcolaDanno() {
    let dannoBase = giocatore.arma.danno;
    
    const boost = giocatore.passivi.find(p => p.effetto === "boost_atk");
    if (boost) {
        dannoBase *= boost.valore; // Moltiplica per 1.2
    }
    
    return Math.floor(dannoBase);
}
function apriChest() {
    const screen = document.getElementById("chest-screen");
    const lootName = document.getElementById("loot-name");
    const lootDesc = document.getElementById("loot-desc");
    const lootImg = document.getElementById("loot-img");

    let oggettoTrovato = null;
    const r = Math.random();

    // Peschiamo dal database
    const arrayArmature = Object.values(db.armature || {});
    const chiaviPassivi = Object.keys(db.passivi || {});
    const chiaviCure = Object.keys(db.consumabili || {}); 

    // 1. Logica Armatura
    if (r < 0.3 && arrayArmature.length > 0) {
        const raritaAttuale = giocatore.armatura ? giocatore.armatura.rarita : 0;
        const armaturePossibili = arrayArmature.filter(a => a.rarita > raritaAttuale);
        
        if (armaturePossibili.length > 0) {
            oggettoTrovato = armaturePossibili[0];
            giocatore.armatura = oggettoTrovato;
            aggiungiLog(`🛡️ Hai equipaggiato: ${oggettoTrovato.nome}!`);
        }
    } 
    
    // 2. Logica Passivi
    if (!oggettoTrovato && r < 0.6 && chiaviPassivi.length > 0) {
        const chiaviDisponibili = chiaviPassivi.filter(chiave => !giocatore.passivi.includes(chiave));
        
        if (chiaviDisponibili.length > 0) {
            const chiaveScelta = chiaviDisponibili[Math.floor(Math.random() * chiaviDisponibili.length)];
            giocatore.passivi.push(chiaveScelta); 
            oggettoTrovato = db.passivi[chiaveScelta];
            aggiungiLog(`💍 Nuovo passivo ottenuto: ${oggettoTrovato.nome}!`);
        }
    }

    // 3. Logica Cura 
    if (!oggettoTrovato && chiaviCure.length > 0) {
        const idRandom = chiaviCure[Math.floor(Math.random() * chiaviCure.length)];
        oggettoTrovato = db.consumabili[idRandom];
        aggiungiAInventario(idRandom);
        aggiungiLog(`🧪 Hai raccolto: ${oggettoTrovato.nome}!`);
    }

    // Default di sicurezza
    if (!oggettoTrovato) {
        oggettoTrovato = { nome: "Polvere Magica", desc: "Hai già svuotato questo mondo dai suoi tesori!" };
        aggiungiLog(`✨ Trovi solo della Polvere Magica...`);
    }

    if (oggettoTrovato) {
        lootName.innerText = oggettoTrovato.nome;
        lootDesc.innerText = oggettoTrovato.desc || "Un oggetto misterioso...";

        // 🖼️ GESTIONE IMMAGINE
        if (oggettoTrovato.sprite) {
            lootImg.src = oggettoTrovato.sprite;
            lootImg.style.display = "block"; // La mostriamo
        } else {
            lootImg.style.display = "none";  // La nascondiamo se non c'è foto
        }
    }
    gameState.animazioneInCorso = true;
    if (screen) screen.classList.add("visible");
    aggiornaUI();
}

function aggiungiAInventario(idOggetto) {
    // 1. Cerca se l'oggetto esiste già nell'inventario del giocatore
    const slotEsistente = giocatore.inventario.find(slot => slot.id === idOggetto);

    if (slotEsistente) {
        // 2. Se lo hai già, aumenta semplicemente la quantità
        slotEsistente.quantita += 1;
    } else {
        // 3. Se è la prima volta che lo trovi, crea un nuovo slot
        giocatore.inventario.push({ id: idOggetto, quantita: 1 });
    }
}
async function prossimoLivello() {
    // 1. Chiudiamo la schermata
    document.getElementById("chest-screen").classList.remove("visible");
    
    // 2. Ora avanziamo di mondo (dopo aver preso l'oggetto)
    worldCounter++;
    stageCounter = 1; 
    aggiungiLog(`🌍 BENVENUTO NEL MONDO ${worldCounter}! 🌍`);
    
    await aspetta(1000); // Piccola pausa scenica
    
    // 3. Generiamo il primo nemico del nuovo mondo
    nemico = generaNemico(); 
    
    // 4. Sblocchiamo il gioco
    gameState.fase = "TURNO_GIOCATORE";
    gameState.animazioneInCorso = false; // 🔓 Tasti finalmente sbloccati
    
    aggiornaUI();
    aggiungiLog(`⚠️ Un nuovo nemico appare: ${nemico.nome}! È il tuo turno.`);
}
// Inizializza la UI all'avvio
aggiornaUI();