const database={
    //Ogni arma base ha solo abilità passiva condivisa da tutte le armi di quel tipo, le armi normali avranno anche abilità attiva
    armi:{
        //Oggetto spada base
        spada:{
            nome: "Spada",
            atk:15,
            sprite:"assets/weapons/sword.png",
            rarita:0,
            tipo:"normale",
            //abilità passiva bleed:ogni attacco aggiungerà 1 di danno 
            abilita_passiva(){
                return danno_aggiuntivo=1;
            },
            descrizione: "La più fidata arma per un cavaliere, non dimenticarla mai in uno scontro",
            abilita_attiva(){
                return this.atk*2;
            }
        },
        //Oggetto arco base
        arco:{
            nome: 0,
            atk:5,
            sprite:"assets/weapons/bow.png",
            rarita:"comune",
            tipo:"normale",

            //abilità passiva multishot: spara un numero compreso tra 1 e 4 frecce ad attacco
            abilita_passiva(){
                const n = Math.floor(Math.random() * 4) + 1; // 1-4 frecce
                const dannoTotale = n * this.atk; // Calcola il totale
                return dannoTotale; // Restituisce il valore, ma NON cambia this.atk
            },
            descrizione: "Robin Hood chi? Con questo arco sarai molto meglio... Forse"
        },
        //Oggetto ascia base
        ascia:{
            nome: "Ascia",
            atk:15,
            sprite:"assets/weapons/axe.png",
            rarita:0,
            tipo:"normale",

            //abilità passiva crit chance: ogni attacco ha una possibiltà del 20% di infliggere il doppio del danno
            abilita_passiva(){      
                chance = controllaSuccesso(20);
                if(chance){
                    return danno_aggiuntivo=this.atk*2;
                }
                else{
                    return this.atk;
                }
            },
            descrizione: "Vai e zappa nemici come i migliori canadesi fanno con gli alberi!",
        },
        //Oggetto tirapugni base
        tirapugni:{
            nome: "Tirapugni",
            atk:10,
            sprite:"assets/weapons/brass_knuckles.png",
            rarita:0,
            tipo:"normale",
            //abilità passiva doppio colpo: ogni attacco colpisci due volte
            abilita_passiva(){
                return this.atk*2;
            },
            descrizione:"Cazzo mi è rimasto del sangue fra le nocche, mi renderà più forte magari",
        },
        //Oggetto lancia base
        lancia:{
            nome:"Lancia",
            atk:15,
            sprite:"assets/weapons/spear.png",
            rarita:0,
            tipo:"normale",
            //abilità passiva doppio affondo: ogni attacco ha una possibilità del 20% di fare un secondo attacco al nemico che infligge 5 danni in più 
            abilita_passiva(){
                chance = controllaSuccesso(20);
                if(chance){
                    return danno_aggiuntivo=this.atk+5;
                }
                else{
                    return 0;
                }
            },
            descrizione:"Un'arma dalla lunga gittata, attenzione ai suoi potenti affondi!",
        },

        spadaFuoco:{
            nome:"Spada di fuoco",
            atk:20,
            descrizione:"Una spada forgiata nelle fiamme dell'inferno pronta incenerire i tuoi nemici!",
            sprite:"assets/weapons/flame_sword",
            tipo:"fuoco",
            rarita:2,
            abilita_passiva(){
                return danno_aggiuntivo=this.atk+1;
            },
            //abilità attiva:spara una palla di fuoco che infligge 30 danni 
            abilita_attiva(){
                aggiungiLog("🔥Hai lanciato una palla di fuoco!");
                return 30;
            },
        },

        
    },
    //a differenza delle armi le armature avranno passive diverse senza abilità attive
    armature:{
        armaturaMaglia:{
            nome:"Armatura di maglia",
            difesa:5,
            sprite:"assets/armors/chainmail.png",
            rarita:0,
            descrizione:"Una resistente armatura in cotta di maglia, con lei non si sbaglia mai!",
            //l'armatura base non aggiunge nessuna abilità passiva (per questione di codice però ne inserisco una vuota per evitare errori)
            abilita_passiva(){
                return 0;
            },
        },

        armaturaFerro:{
            nome:"Armatura di ferro",
            difesa:10,
            sprite:"assets/armors/iron_armor.png",
            rarita:1,
            descrizione:"Una solida e pesante armatura in ferro, una garanzia per eludere i colpi nemici!",
            //L'armatura ha la possibilità del 20% di aumentare la difesa di 5 punti per un turno
            abilita_passiva(){
                chance = generaRandom();
                if(chance){
                    aggiungiLog("🛡️ Attacco resistito!");
                    return 5;
                }
                else{
                    return 0;
                }
            }
        },

        armaturaAngelica:{
            nome:"Armatura Angelica",
            difesa:15,
            sprite:"assets/armors/angelic_armor.png",
            rarita:5,
            descrizione:"armatura creata dagli angeli, chiunque la indossi sarà benedetto in ogni battaglia",
            //Ogni turno cura il giocatore di 5 hp
            abilita_passiva(){
                const cura = 5;
                giocatore.hp = Math.min(giocatore.maxHp, giocatore.hp + cura);
                aggiungiLog("✨ L'Armatura Angelica ti cura di 5 HP!");
                aggiornaUI();
                return 0;
            }
        }
    },
    nemici:{
        slime: { 
            nome: "Slime", 
            hp: 20, 
            maxHp:20, 
            attacco: 5, 
            stato:null,
            sprite: "assets/enemies/slime.png"
        },
        goblin: { 
            nome: "Goblin", 
            hp: 80, 
            maxHp:80, 
            attacco: 8, 
            stato:null,
            sprite: "assets/enemies/goblin.png"
        },
        scheletro: { 
            nome: "Guerriero Osseo", 
            hp: 100, 
            maxHp:100,
            attacco: 12, 
            stato:null,
            sprite: "assets/enemies/skeleton.png",
        },
    },
    consumabili: {
        pozione_base: {
            nome: "Pozione Verde",
            descrizione: "Una pozione comune. Cura 30 HP.",
            cura: 30,
            sprite: "assets/consumables/potion.png"
        },
        pane: {
            nome: "Pane Casereccio",
            descrizione: "Semplice ma nutriente. Cura 15 HP.",
            cura: 15,
            sprite: "assets/consumables/bread.png"
        },
        erba_magica: {
            nome: "Erba Curativa",
            descrizione: "Erba amara che rigenera 50 HP.",
            cura: 50,
            sprite: "assets/consumables/herb.png"
        }
    },
    passivi: {
    anello_vita: { 
        nome: "Anello Rigenerante", 
        tipoEffetto: "cura_inizio_turno", // Categoria dell'effetto
        valore: 5,
        sprite:"assets/passives/heal_ring.png"                         // Quanto cura
    },
    ciondolo_forza: { 
        nome: "Ciondolo Forza", 
        tipoEffetto: "moltiplicatore_danno", 
        valore: 1.2,
        sprite:"assets/passives/strength_pendant.png"                       // +20%
    },
    spada_rotta: {
        nome: "Lama Arrugginita",
        tipoEffetto: "danno_piatto",
        valore: 10,
        sprite:"assets/passives/broken_sword.png"                      // +10 danni fissi
    }
    },
    
        
    personaggi:{
        cavaliere:{
            nome:"Cavalier Pristol",
            hp: 100,
            maxHp: 100,
            arma: "tirapugni",
            armatura:null,
            stato:null,
            inventario:[],
            passivi:[],
            sprite: "assets/characters/base_knight.png"
        },
    },
}
module.exports = database;
function controllaSuccesso(percentuale) {
    return Math.random() * 100 < percentuale;
}