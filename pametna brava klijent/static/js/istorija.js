'use strict'
let token = localStorage.getItem("token");
const ime = document.querySelector(".ime");
const prezime = document.querySelector(".prezime");
const tbody = document.querySelector("#inekcija");
const idistorija = localStorage.getItem("korisnikId");
const sortiranje = document.querySelector(".h3");

if (!localStorage.getItem("dozvoljen_pristup")) {
    console.log("Nemate dozvolu za pristup ovoj stranici!");
    window.location.href = "index.html";  // Preusmeravanje na početnu stranicu
}


sortiranje.addEventListener("click", function(e){
    e.preventDefault();

    let s = localStorage.getItem("sort");
    if(s === "desc"){
        localStorage.setItem("sort","asc");
    }
    else{
        localStorage.setItem("sort", "desc");
    }

    window.location.href = "istorija.html";

})



window.onload = async function() {
    let tokenn = localStorage.getItem("token");
    if (!tokenn) {
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }
    else{
        try {
            const response = await fetch(`http://samsungappslab.vtsnis.edu.rs:3000/istorija/${idistorija}`, {
                method: 'GET',
                credentials: "include",
                headers: {
                    'Authorization': `Bearer ${token}`,  // Dodaj token za autentifikaciju
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`Greška: ${response.status} ${response.statusText}`);
            }
    
            const data = await response.json();
            
            
            ime.innerHTML = data.korisnik[0].ime;
            prezime.innerHTML = data.korisnik[0].prezime
    
            let sortic = localStorage.getItem("sort");
            if(sortic === "desc"){
                data.istorija.reverse();
            }
            
    
            data.istorija.forEach(i => {
                const row = document.createElement('tr');
                
                // Kreiranje ćelija za svaki korisnik
                row.innerHTML = `
                    <td>${i.vreme_dolaska}</td>
                    <td>${i.vreme_izlaska}</td>
                `;
        
                // Dodaj red u tabelu
                tbody.appendChild(row);
            });
    
            
        }
        catch (error) {
            console.error('Došlo je do greške:', error);
        }
    }

   

}
