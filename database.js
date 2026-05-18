const database={
    //Ogni arma base ha solo abilità passiva condivisa da tutte le armi di quel tipo, le armi normali avranno anche abilità attiva
    armi:{
        //Oggetto spada base
        spada:{
            nome: "Spada",
            atk:15,
            sprite:"assets/sword.png",
            //abilità passiva bleed:ogni attacco aggiungerà 1 di danno 
            abilita_passiva(){
                return danno_aggiuntivo=1;
            },
            descrizione: "La più fidata arma per un cavaliere, non dimenticarla mai in uno scontro"
        },
        //Oggetto arco base
        arco:{
            nome: "Arco",
            atk:5,
            sprite:"assets/bow.png",
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
            sprite:"assets/axe.png",
            //abilità passiva crit chance: ogni attacco ha una possibiltà del 20% di infliggere il doppio del danno
            abilita_passiva(){      
                chance = generaRandom();
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
            sprite:"assets/brass_knuckles.png",
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
            sprite:"assets/spear.png",
            //abilità passiva doppio affondo: ogni attacco ha una possibilità del 20% di fare un secondo attacco al nemico che infligge 5 danni in più 
            abilita_passiva(){
                chance = generaRandom();
                if(chance){
                    return danno_aggiuntivo=this.atk+5;
                }
                else{
                    return 0;
                }
            },
            descrizione:"Un'arma dalla lunga gittata, attenzione ai suoi potenti affondi!",
        }
    },
    //a differenza delle armi le armature avranno passive diverse senza abilità attive
    armature:{
        armaturaMaglia:{
            nome:"Armatura di maglia",
            difesa:5,
            sprite:"assets/chainmail.png",
            descrizione:"Una resistente armatura in cotta di maglia, con lei non si sbaglia mai!",
            //l'armatura base non aggiunge nessuna abilità passiva (per questione di codice però ne inserisco una vuota per evitare errori)
            abilita_passiva(){
                return 0;
            },
        },

        armaturaFerro:{
            nome:"Armatura di ferro",
            difesa:10,
            sprite:"assets/iron_armor.png",
            descrizione:"Una solida e pesante armatura in ferro, una garanzia per eludere i colpi nemici!",
            //L'armatura ha la possibilità del 20% di aumentare la difesa di 5 punti per un turno
            abilita_passiva(){
                if(chance){
                    aggiungiLog("Attacco resistito!");
                    return armaturaFerro.difesa+5;
                }
                else{
                    return 0;
                }
            }
        }
    },
    nemici:{
        slime: { 
            nome: "Slime", 
            hp: 40, 
            maxHp:40, 
            attacco: 5, 
            sprite: "assets/slime.png"
        },
        goblin: { 
            nome: "Goblin", 
            hp: 80, 
            maxHp:80, 
            attacco: 12, 
            sprite: "assets/goblin.png"
        },
        scheletro: { 
            nome: "Guerriero Osseo", 
            hp: 100, 
            maxHp:100,
            attacco: 12, 
            sprite: "assets/skeleton.png",
        },
    },
    personaggi:{
        cavaliere:{
            nome:"Cavalier Pristol",
            hp: 100,
            maxHp: 100,
            arma: "ascia",
            armatura:"armaturaMaglia",
            sprite: "assets/base_knight.png"
        },
    },
}
module.exports = database;
function generaRandom() {
    let array=[];
    let estratto=false;
    for(let i=0;i<5;i++){
        if(estratto){
            array.push(1);
        }
        else{
            dato=Math.floor(Math.random()*2);
            if(dato==0){
                estratto=true;
            }
            array.push(dato);
        }
    }
    let idx=Math.floor(Math.random()*5);
    if(array[idx]==0){
        return true;
    }
    else{
        return false;
    }
}