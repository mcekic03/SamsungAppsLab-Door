


if (!sessionStorage.getItem("dozvoljen_pristup") && !localStorage.getItem("zapamti")) {
    console.log("Nemate dozvolu za pristup ovoj stranici!");
    window.location.href = "index.html";  // Preusmeravanje na početnu stranicu
}

window.onload = function(e) {
    const zapamti = localStorage.getItem("zapamti");
    if(zapamti === "true"){
        console.log(zapamti);
        localStorage.setItem("tt", sessionStorage.getItem("token"));
        localStorage.setItem("rr", sessionStorage.getItem("rola"));
    }
    else{
        localStorage.clear();
    }
   
    


    if (!token) {
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }
   e.preventDefault();
   if(rola === "administrator"){
    console.log(rola)
    document.querySelector("#admin").innerHTML = `<a href="korisnici.html">Korisnici</a>`;
   }
   else{
    console.log("user")
    document.querySelector("#admin").innerHTML =` `;
   }

};


const dugmeOdkljucaj = document.querySelector(".odkljucavanje");

let token = sessionStorage.getItem("token");
let rola = sessionStorage.getItem("rola");

dugmeOdkljucaj.addEventListener("click", async function(e) {
    let tokenn = sessionStorage.getItem("token");
    if (!tokenn) {
        
        // Ako rola ne postoji, preusmeri korisnika na login stranicu
        window.location.href = "index.html"; 
    }
    else{
        e.preventDefault();
        document.querySelector(".lock-img").src = "static/photos/unlocked_lock.svg"
        const response = await fetch('http://samsungappslab.vtsnis.edu.rs:3000/appp', {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer `+ token  // Slanje JWT tokena u Authorization zaglavlju
            }
        });
            
    
        const data = await response.json();
        if(data.msg === "Token has expired"){
            sessionStorage.clear();
            window.location.href = "index.html";
        }
        
        if(data.message === "trenutno ne mozete odkljucati laboratoriju"){
            alert("admin vam je ukinuo pristup");
        }
        else{
            document.querySelector(".lock-img").src = "static/photos/locked lock.svg"
            if(data.message==="gost"){
                localStorage.clear();
                window.location.href = "index.html"
            }
        }
    }
   
    
});


document.querySelector(".fa-sign-out").addEventListener("click", function(){
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "index.html";
})


setInterval(() => {
    sessionStorage.clear();
    console.log("localStorage je očišćen.");
  }, 60 * 60 * 1000);  
  



 