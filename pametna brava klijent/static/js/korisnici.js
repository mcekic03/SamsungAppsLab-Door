'use strict';

let token = localStorage.getItem("token");
const tabelaBody = document.getElementById('korisniciTabela');
tabelaBody.innerHTML = '';  // Očisti tabelu pre nego što dodaš nove redove

if (!localStorage.getItem("dozvoljen_pristup")) {
    console.log("Nemate dozvolu za pristup ovoj stranici!");
    window.location.href = "index.html";  // Preusmeravanje na početnu stranicu
}


document.querySelector("#gostiomoguci").addEventListener("click", async function(e) {
    e.preventDefault();
    const response = await fetch(`http://samsungappslab.vtsnis.edu.rs:3000/gostionica`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Authorization': `Bearer ${token}`,  // Dodaj token za autentifikaciju
            'Content-Type': 'application/json'
        },
        body: JSON.stringify("gosti?")
    });

    const data = await response.json();
    localStorage.setItem("gostionica", data.message);
    
    
    if (response.ok) {
        // Možeš sačuvati token u localStorage ili sessionStorage
        console.log(data);
        
        window.location.href = "korisnici.html";
    } else {
        alert("Greška: " + data.message);
    }

})


window.onload = async function() {
    let tokenn = localStorage.getItem("token");
    if (!tokenn) {
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }
    try {
        try {
            const response = await fetch('http://samsungappslab.vtsnis.edu.rs:3000/gosti-dozvola', {
                method: 'GET',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`Greška: ${response.status} ${response.statusText}`);
            }
    
            const dozvola = await response.json();
            

            if(dozvola.message === "False"){
                document.querySelector(".span2").classList.remove("oo");
                document.querySelector(".span1").classList.add("oo");
            }
            else{
                document.querySelector(".span1").classList.remove("oo");
                document.querySelector(".span2").classList.add("oo");
                localStorage.setItem("dozvoljen_pristup", "da");
            }


        }catch (error){
                console.log(error);
            }

        


        const response = await fetch('http://samsungappslab.vtsnis.edu.rs:3000/korisnici', {
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

        const korisnici = await response.json();
       
        korisnici.forEach(korisnik => {
            const row = document.createElement('tr');
            
            // Kreiranje ćelija za svaki korisnik
            row.innerHTML = `
                <td>${korisnik.ime}</td>
                <td>${korisnik.prezime}</td>
                <td>${korisnik.email}</td>
                <td>${korisnik.rola}</td>
                <td>${korisnik.odobrenje}</td>
                <td>${korisnik.datum_kreiranja}</td>
                <td class="row">
    <!-- Dugme za izmenu -->
    <button class="izmenaB text-warning mx-3" data-value="${korisnik.id}">
        <i class="fa-solid fa-pen-to-square"></i>
    </button>

    <!-- Dugme za prikaz istorije dolazaka -->
    <button class="istorijaB text-info mx-3" data-value="${korisnik.id}">
        <i class="fa-solid fa-bars"></i>
    </button>

    <!-- Dugme za brisanje korisnika -->
    <button class="brisanjeB text-danger mx-3" data-value="${korisnik.id}">
        <i class="fas fa-trash"></i>
    </button>
</td>


            `;
    
            // Dodaj red u tabelu
            tabelaBody.appendChild(row);
        });



    } catch (error) {
        console.error('Došlo je do greške:', error);
    }
};




    // Dodajemo event listener za sva dugmad
    document.addEventListener("DOMContentLoaded", function () {
        document.body.addEventListener("click", function (event) {
            let tokennn = localStorage.getItem("token");
            if (!tokennn) {
                // Ako rola ne postoji, preusmeri korisnika na login stranicu
                window.location.href = "index.html"; 
            }

            let button = event.target.closest("button"); // Pronalaženje kliknutog dugmeta
            
            if (!button) return; // Ako kliknuti element NIJE dugme, prekidamo funkciju
            
            let korisnikId = button.getAttribute("data-value");
            if (!korisnikId) return; // Ako nema data-value, izlazimo
    
            // Čuvanje u LocalStorage
            localStorage.setItem("korisnikId", korisnikId);
    
            // Provera koji je button kliknut i preusmeravanje
            if (button.classList.contains("izmenaB")) {
                window.location.href = "izmena.html";
            } else if (button.classList.contains("istorijaB")) {
                window.location.href = "istorija.html";
            } else if (button.classList.contains("brisanjeB")) {
                if (confirm("Da li ste sigurni da želite da obrišete korisnika?")) {

                    fetch(`http://samsungappslab.vtsnis.edu.rs:3000/korisnik-brisanje/${korisnikId}`, { 
                        method: "POST",
                        credentials: "include",
                        headers: {
                                    'Authorization': `Bearer ${token}`,  // Dodaj token za autentifikaciju
                                }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Greška pri brisanju korisnika.");
                        }
                        return response.text(); // Očekujemo tekstualni odgovor (ne JSON)
                    })
                    .then(data => {
                        console.log("Odgovor servera:", data);
                        alert("Korisnik uspešno obrisan!");
                    })
                    .catch(error => {
                        console.error("Došlo je do greške:", error);
                        alert("Brisanje nije uspelo.");
                    });

                    window.location.reload();

                }
            }
        });
    });

    localStorage.setItem("sort","desc");
    
    setInterval(() => {
        localStorage.clear();
        console.log("localStorage je očišćen.");
      }, 14 * 60 * 1000);  


