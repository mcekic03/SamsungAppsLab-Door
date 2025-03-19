'use strict'

let token = sessionStorage.getItem("token");

if (!sessionStorage.getItem("dozvoljen_pristup")) {
    console.log("Nemate dozvolu za pristup ovoj stranici!");
    window.location.href = "index.html";  // Preusmeravanje na početnu stranicu
}



window.onload = function(){
    let tokennn = sessionStorage.getItem("token");
    if (!tokennn) {
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }
}

document.querySelector("#forma").addEventListener("submit",async function(event) {
    event.preventDefault(); // Sprečava podrazumevano slanje forme
    let tokenn = sessionStorage.getItem("token");
    if (!tokenn) {
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }
    else{
        const formData = new FormData(event.target); // Kreira FormData objekat
        const formEntries = Object.fromEntries(formData.entries()); // Pretvara u običan objekat

        console.log("Uneti podaci:", formEntries);

        const response = await fetch('http://samsungappslab.vtsnis.edu.rs:3000/korisnik-novi', {
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
        window.location.href = "korisnici.html";
        console.log(data.message);
        } else {
        alert("Greška: " + data.message);
        }
    }

    


});

setInterval(() => {
    sessionStorage.clear();
    console.log("localStorage je očišćen.");
  }, 14 * 60 * 1000);  
