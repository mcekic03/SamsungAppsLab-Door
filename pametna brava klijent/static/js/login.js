

window.onload = function(){
    localStorage.clear();
}


document.getElementById("loginButton").addEventListener("click", async function() {
    const email = document.getElementById("email").value;
    const lozinka = document.getElementById("password").value;
    
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
                localStorage.setItem("dozvoljen_pristup", "da");
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
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("rola", data.rola);
            localStorage.setItem("dozvoljen_pristup", "da");
            window.location.href = "app.html";
        } else {
            alert("Greška: " + data.message);
        }
    }




    
});
