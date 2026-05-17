const database={
    //Ogni arma base ha solo abilità passiva condivisa da tutte le armi di quel tipo, le armi normali avranno anche abilità attiva
    armi:{
        //Oggetto spada base
        spada:{
            nome: "Spada",
            atk:15,
            sprite:"assets/sword.png",
            //abilità passiva bleed:ogni attacco aggiungerà 1 di danno 
            abilità_passiva(){
                return danno_aggiuntivo=1;
            },
        },
        //Oggetto arco base
        arco:{
            nome: "Arco",
            atk:5,
            sprite:"assets/bow.png",
            //abilità passiva multishot: spara un numero compreso tra 1 e 4 frecce ad attacco
            abilità_passiva(){
                const n = Math.floor(Math.random() * 4) + 1; // 1-4 frecce
                const dannoTotale = n * this.atk; // Calcola il totale
                return dannoTotale; // Restituisce il valore, ma NON cambia this.atk
            },
        },
        //Oggetto ascia base
        ascia:{
            nome: "Ascia",
            atk:15,
            sprite:"assets/axe.png",
            //abilità passiva crit chance: ogni attacco ha una possibiltà del 20% di infliggere il doppio del danno
            abilità_passiva(){      
                chance = generaRandom();
                if(chance){
                    return danno_aggiuntivo=this.atk*2;
                }
                else{
                    return this.atk;
                }
            }
        },
        //Oggetto tirapugni base
        tirapugni:{
            nome: "Tirapugni",
            atk:10,
            sprite:"assets/brass_knuckles.png",
            //abilità passiva doppio colpo: ogni attacco colpisci due volte
            abilità_passiva(){
                return this.atk*2;
            }
        },
        //Oggetto lancia base
        lancia:{
            nome:"Lancia",
            atk:15,
            sprite:"assets/spear.png",
            //abilità passiva doppio affondo: ogni attacco ha una possibilità del 20% di fare un secondo attacco al nemico che infligge 5 danni in più 
            abilità_passiva(){
                chance = generaRandom();
                if(chance){
                    return danno_aggiuntivo=this.atk+5;
                }
                else{
                    return 0;
                }
            }
        }
    },
    //a differenza delle armi le armature avranno passive diverse senza abilità attive
    armature:{
        armaturaMaglia:{
            difesa:5,
            sprite:"assets/chainmail.png",
            //l'armatura base non aggiunge nessuna abilità passiva
        },
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
            arma: "tirapugni",
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