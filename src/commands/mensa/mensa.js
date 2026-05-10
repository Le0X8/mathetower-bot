import { EmbedBuilder, time} from 'discord.js';
export async function mensamsg(message){
    const res = await fetch("https://mobil.itmc.tu-dortmund.de/canteen-menu/v3/canteens/341");
    const date = new Date();
    const localTime = date.toLocaleDateString("en-CA", "Europe/Berlin");    //for the YYYY-MM-DD format
    const retObj = await res.json();
    const msg = await new EmbedBuilder().setColor(0x639A00).setTitle("__Heutiges Menü:__").setDescription("Hauptmensa\n Stand: " + time(date, 'D')).addFields(
        {
            name: retObj[localTime][0].counter, value: "Beschreibung:\n`" + retObj[localTime][0].title.de + "`\n> Preis: " + retObj[localTime][0].price.student
        }, {
            name: retObj[localTime][1].counter, value: "Beschreibung:\n`" + retObj[localTime][1].title.de + "`\n> Preis: " + retObj[localTime][1].price.student
        }, {
            name: retObj[localTime][2].counter, value: "Beschreibung:\n`" + retObj[localTime][2].title.de + "`\n> Preis: " + retObj[localTime][2].price.student
        }, {
            name: retObj[localTime][3].counter, value: "Beschreibung:\n`" + retObj[localTime][3].title.de + "`\n> Preis: " + retObj[localTime][3].price.student
        }, {
            name: retObj[localTime][4].counter, value: "Beschreibung:\n`" + retObj[localTime][4].title.de + "`\n> Preis: " + retObj[localTime][4].price.student
        }, {
            name: retObj[localTime][5].counter, value: "Beschreibung:\n`" + retObj[localTime][5].title.de + "`\n> Preis: " + retObj[localTime][5].price.student
        }, {
            name: retObj[localTime][6].counter, value: "Beschreibung:\n`" + retObj[localTime][6].title.de + "`\n> Preis: " + retObj[localTime][6].price.student
        }, {
            name: retObj[localTime][7].counter, value: "Beschreibung:\n`" + retObj[localTime][7].title.de + "`\n> Preis: " + retObj[localTime][7].price.student
        }).setFooter({text: "Made by Nick1411", iconURL: "https://cdn.discordapp.com/attachments/1246849048766447638/1503183246983430154/image.png?ex=6a026bfd&is=6a011a7d&hm=a6d5c055d2f524a0347d16bbf1c6c04417496868d6206d92d0cddf02b4d5bf1d&"});                                 //please make this shit better i dont like that its hardcoded to 7 but its 01:40 i cannot be bothered rn
    message.reply({embeds: [msg]});
}  