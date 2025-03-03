'use strict'
let token = localStorage.getItem("token");
const tbody = document.querySelector("#inekcija");
const idistorija = localStorage.getItem("korisnikId");
const sortiranje = document.querySelector(".h3");
localStorage.setItem("sortg","desc");
if (!localStorage.getItem("dozvoljen_pristup")) {
    console.log("Nemate dozvolu za pristup ovoj stranici!");
    window.location.href = "index.html";  // Preusmeravanje na početnu stranicu
}






window.onload = async function() {
    if (!token) {
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }

    try {
        const response = await fetch(`http://samsungappslab.vtsnis.edu.rs:3000/istorijaGosti`, {
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
        
            data.istorija.reverse();
        
        data.istorija.forEach(i => {
            const row = document.createElement('tr');
            
            // Kreiranje ćelija za svaki korisnik
            row.innerHTML = `
                <td>${i.ime}</td>
                <td>${i.prezime}</td>
                <td>${i.created_at}</td>
            `;
    
            // Dodaj red u tabelu
            tbody.appendChild(row);
        });

        
    }
    catch (error) {
        console.error('Došlo je do greške:', error);
    }

}
