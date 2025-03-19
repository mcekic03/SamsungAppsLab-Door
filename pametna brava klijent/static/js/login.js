

window.onload = function(){
    if(localStorage.getItem("brisi")){
        localStorage.clear();
        sessionStorage.clear();
    }
    if(localStorage.getItem("zapamti")){
        sessionStorage.setItem("token", localStorage.getItem("tt"));
        sessionStorage.setItem("rola", localStorage.getItem("rr"));
        sessionStorage.setItem("dozvoljen_pristup", "da");
        window.location.href = "app.html";
    }
    else{
        sessionStorage.clear();
        localStorage.clear();
    }
    
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        document.getElementById("loginButton").click(); // Simulira klik na dugme
    }
});


document.getElementById("loginButton").addEventListener("click", async function() {
    const email = document.getElementById("email").value;
    const lozinka = document.getElementById("password").value;
    const zapamti = document.getElementsByClassName("zapamti")[0].checked;
    localStorage.setItem("zapamti", zapamti);
    
    if(email === "guest" && lozinka === "guest"){
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
                alert("Nemate pristup kao gost, zatrazite pristup od administratora")
            }
            else{
                sessionStorage.setItem("dozvoljen_pristup", "da");
                window.location.href = "gosti.html";
            }


        }catch (error){
                console.log(error);
            }
        
    }
    else{
        const response = await fetch('http://samsungappslab.vtsnis.edu.rs:3000/login', {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, lozinka })
        });
    
        const data = await response.json();
        
        if (response.ok) {
            // Možeš sačuvati token u localStorage ili sessionStorage
            sessionStorage.setItem("token", data.access_token);
            sessionStorage.setItem("rola", data.rola);
            sessionStorage.setItem("dozvoljen_pristup", "da");
            window.location.href = "app.html";
        } else {
            alert("Greška: " + data.message);
        }
    }




    
});
