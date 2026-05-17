const database={
    armi:{
        spada:{
            atk:15,
            sprite:"assets/sword.png",
            //abilità passiva bleed:ogni attacco aggiungerà 1 di danno 
            abilità_passiva(){
                return danno_aggiuntivo=1;
            },
        },
        arco:{
            atk:5,
            sprite:"assets/bow.png",
            //abilità passiva multishot: spara un numero compreso tra 1 e 4 frecce ad attacco
            abilità_passiva(){
                max=4;
                min=1;
                function generaRandom(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
                numeroFreccie = generaRandom(min, max);
                return numeroFreccie*this.atk;
            },
        },
        ascia:{
            atk:15,
            sprite:"assets/axe.png",
            //abilità passiva crit chance: ogni attacco ha una possibiltà dwl 20% di infliggere il doppio del danno
            abilità_passiva(){
                max=100;
                min=1;
                function generaRandom(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
                chance = generaRandom(min, max);
                if(chance<=20){
                    return danno_aggiuntivo=this.atk*2;
                }
                else{
                    return this.atk;
                }
            }
        },
        tirapugni:{
            atk:10,
            sprite:"assets/brass_knuckles.png",
            //abilità passiva doppio colpo: ogni attacco colpisci due volte
            abilità_passiva(){
                return this.atk*2;
            }
        },
        lancia:{
            atk:15,
            sprite:"assets/spear.png",
            //abilità passiva doppio affondo: ogni attacco ha una possibilità del 20% di fare un secondo attacco al nemico che infligge 5 danni in più 
            abilità_passiva(){
                max=100;
                min=1;
                function generaRandom(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
                chance = generaRandom(min, max);
                if(chance<=20){
                    return danno_aggiuntivo=this.atk+5;
                }
                else{
                    return this.atk;
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
        slime: { nome: "Slime", hp: 40, attacco: 5, sprite: "assets/slime.png" },
        goblin: { nome: "Goblin", hp: 80, attacco: 12, sprite: "assets/goblin.png" }
    },
    personaggi:{
        cavaliere:{
            nome:"Cavalier Pristol",
            hp: 100,
            maxHp: 100,
            arma:{nome: "Spada di Legno", danno:15},
            sprite: "assets/base_knight.png"
        },
    },
}
module.exports = database;