'use strict'
let token = sessionStorage.getItem("token");
console.log(sessionStorage.getItem("korisnikId"));

const idizmena = sessionStorage.getItem("korisnikId");
let forma = document.getElementById("forma");

if (!sessionStorage.getItem("dozvoljen_pristup")) {
    console.log("Nemate dozvolu za pristup ovoj stranici!");
    window.location.href = "index.html";  // Preusmeravanje na početnu stranicu
}

window.onload = async function() {
    let tokenn = sessionStorage.getItem("token");
    if (!tokenn) {
        
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }
    else{
        try {
            const response = await fetch(`http://samsungappslab.vtsnis.edu.rs:3000/korisnik-izmena/${idizmena}`, {
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
    
            const korisnik = await response.json();
            console.log(korisnik);
            forma['ime'].value = korisnik[0].ime
            forma['prezime'].value = korisnik[0].prezime
            forma['email'].value = korisnik[0].email
            forma['rola'].value = korisnik[0].rola
            forma['odobrenje'].value = korisnik[0].odobrenje
            forma['lozinka'].value = "izmenite lozinku"
    
        }
        catch (error) {
            console.error('Došlo je do greške:', error);
        }
    }
    
    


}


forma.addEventListener("submit",async function(event) {
    event.preventDefault();
    let tokennn = sessionStorage.getItem("token");
    if (!tokennn) {
        
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }
    else{
        const formData = new FormData(event.target); // Kreira FormData objekat
        const formEntries = Object.fromEntries(formData.entries()); // Pretvara u običan objekat

        console.log("Uneti podaci:", formEntries);

        const response = await fetch(`http://samsungappslab.vtsnis.edu.rs:3000/korisnik-izmena/${idizmena}`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Authorization': `Bearer ${token}`,  // Dodaj token za autentifikaciju
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formEntries)
        });

        const data = await response.json();
    
        if (response.ok) {
        // Možeš sačuvati token u localStorage ili sessionStorage
        alert("korisnik izmenjen")
        
        window.location.href = "korisnici.html";
        } else {
        alert("Greška: " + data.message);
        }
    }
     // Sprečava podrazumevano slanje forme

    


});

setInterval(() => {
    sessionStorage.clear();
    console.log("localStorage je očišćen.");
  }, 14 * 60 * 1000);  