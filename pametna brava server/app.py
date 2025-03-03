from flask import Flask, render_template, url_for, request, redirect, session,jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, get_jwt, jwt_required, get_jwt_identity
from functools import wraps
from mysql.connector import pooling
from flask_cors import CORS
from waitress import serve
import requests
from datetime import timedelta


gosti = False

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['JWT_SECRET_KEY'] = 'tvoj_tajni_jwt_kljuc'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

@app.before_request
def log_request_info():
    """Prati zahteve i čuva ih u bazi."""
    client_ip = request.remote_addr  
    user_agent = request.user_agent.string  
    route = request.path  
    method = request.method  

    log_message = f"Request from {client_ip} - {method} {route} - User-Agent: {user_agent}"
    print(log_message)  # Prikaz u cmd-u

    save_log_to_db(client_ip, method, route, user_agent)  # Čuvanje u bazi



def role_required(roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") not in roles:
                return jsonify({"message": "Nemate dozvolu za pristup ovoj ruti."}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

db_config= {
    "host": "localhost",
    "port": 3308,
    "user": "root",
    "password": "root",
    "database": "vtsappslab",
}
pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=10, **db_config)

def izvrsi_upitData(upit,vrednosti=()):
    try:
        con = pool.get_connection()  # Dobijanje konekcije iz pool-a
        cursor = con.cursor(dictionary=True)
        cursor.execute(upit,vrednosti)
        data = cursor.fetchall()
    except mysql.connector.Error as e:
        print(f"Database error: {e}")
        data = None
    finally:
        if cursor:
            cursor.close()
        if con:
            con.close()
    
    return data

def izvrsi_upit(upit, vrednosti=()):
    try:
        con = pool.get_connection()  # Dobija konekciju iz pool-a
        cursor = con.cursor()
        cursor.execute(upit, vrednosti)
        con.commit()  # Potvrđuje promene u bazi
        return True  # Uspešno izvršeno
    except mysql.connector.Error as e:
        print(f"Database error: {e}")
        return False  # Neuspešno izvršeno
    finally:
        if cursor:
            cursor.close()
        if con:
            con.close()  # Vraća konekciju u pool

def save_log_to_db(ip, method, route, user_agent):
    """Čuva log u MySQL bazi."""
    try:
        sql = "INSERT INTO access_logs (ip_address, method, route, user_agent) VALUES (%s, %s, %s, %s)"
        values = (ip, method, route, user_agent)
        izvrsi_upit(sql,values)
    except Exception as e:
        print(f"DB Error: {e}")


@app.route('/login', methods=['POST'])
def login():
    forma = request.json
    
    upit = "SELECT * FROM korisnici WHERE email=%s"
    vrednost = (forma['email'],)
    
    korisnici = izvrsi_upitData(upit,vrednost)
    korisnik = korisnici[0]
    

    if korisnik and check_password_hash(korisnik['lozinka'], forma['lozinka']):
        expires = None if korisnik['id'] == 999 else timedelta(hours=1)
        access_token = create_access_token(
            identity=str(korisnik['id']),
            additional_claims={"role": korisnik['rola']},
            expires_delta=expires
        )
        return jsonify({"message": "Uspešno ste se prijavili.", "access_token": access_token, "rola": korisnik['rola']}), 200
    else:
        return jsonify({"message": "Neispravni podaci za prijavu."}), 401

@app.route('/gosti-dozvola', methods=['GET'])
def dozvola():
    global gosti
    
    if(gosti == True):
        return jsonify({"message": "True"}), 200
    else:
       return jsonify({"message": "False"}), 200
     
@app.route('/logingosti', methods=['POST'])
def loginn():
    forma = request.json
    
    upit = """
    INSERT INTO guest (ime, prezime, created_at) 
    VALUES (%s,%s, NOW());
"""
    vrednost = (forma['ime'],forma['prezime'])

    if izvrsi_upit(upit,vrednost):
        access_token = create_access_token(
            identity="999",
            additional_claims={"role": "user"}
        )
        return jsonify({"message": "Uspešno ste se prijavili.", "access_token": access_token, "rola": "user"}), 200
    else:
        return jsonify({"message": "Neispravni podaci za prijavu."}), 401


@app.route('/gostionica', methods=['POST'])    
@jwt_required()
def gg():
    data = request.json
    global gosti
    if gosti == False:
    
        gosti = True
        return {"message": "gosti dozvoljeni"}, 200
    else:
        gosti = False
        return {"message": "gosti nisu dozvoljeni"}, 200

ESP32_IP = "http://160.99.40.144:3500"

def send_to_esp32():
    try:
        response = requests.post(f"{ESP32_IP}/execute", json={"command": "run_function"})
        return response.text
    except requests.exceptions.RequestException as e:
        return f"Error: {e}"




@app.route('/appp', methods=["POST"])
@jwt_required()
def appp():
    id = get_jwt_identity()
    
    
    
    if id == '999':
        send_to_esp32()
        upit = """
            INSERT INTO istorija_dolazenja (id_korisnika) 
            VALUES (%s);

            """  
        
        vrednost = (999, )
        if izvrsi_upit(upit,vrednost):
            return {"message": "laboratorija odkljucana za root"}, 200

    upit = """
    
    select odobrenje from korisnici where id = %s
    
    """
    v= (id, )
    odobrenje = izvrsi_upitData(upit,v)

    
    if not odobrenje or odobrenje[0]['odobrenje'] == 'ne':
        return {"message": "trenutno ne mozete odkljucati laboratoriju"}, 200
    else:
        send_to_esp32()
        
        upit = """
            INSERT INTO istorija_dolazenja (id_korisnika) 
            VALUES (%s);

            """  
        v= (id, )
        if izvrsi_upit(upit,v):
            return {"message": "laboratorija odkljucana"}, 200
            

#admin panel###############


@app.route('/korisnici', methods=['GET'])
@jwt_required()
@role_required(["administrator"])
def render_korisnici():
    upit = '''SELECT * FROM korisnici WHERE id != 9 and id!=999;'''

    korisnici = izvrsi_upitData(upit)
    return jsonify(korisnici), 200


@app.route('/korisnik-novi', methods=['POST'])
@jwt_required()
@role_required(["administrator"])
def api_novi_korisnik():
    forma = request.json
    upit = "INSERT INTO korisnici (ime, prezime, email, rola, lozinka,odobrenje) VALUES (%s, %s, %s, %s, %s,%s)"
    hash_lozinka = generate_password_hash(forma['lozinka'])
    vrednosti = (forma['ime'], forma['prezime'], forma['email'], forma['rola'], hash_lozinka,forma['odobrenje'])
    
    if izvrsi_upit(upit,vrednosti):
        return jsonify({"message": "Uspešno ste dodali novog korisnika."}), 200
    
@app.route('/korisnik-brisanje/<id>', methods=['POST'])
@jwt_required()
@role_required(["administrator"])
def korisnik_brisanje(id):
    
    IDD=(id, )
    upit = '''DELETE FROM korisnici
              WHERE id = %s;
            '''
    if izvrsi_upit(upit,IDD):
         return jsonify({"message": "uspesno obrisano"}), 200

@app.route('/korisnik-izmena/<id>', methods=['GET','POST'])
@jwt_required()
@role_required(["administrator"])
def izmena(id):
    if request.method == 'GET':
        
        upit = """
        select * from korisnici where id = %s
        """
        IDD = (id, )
        korisnik = izvrsi_upitData(upit,IDD)
        return jsonify(korisnik), 200
    
    if request.method == 'POST':
        forma = request.json
        
        
        if forma['lozinka'] == "izmenite lozinku":
           upit1 = """
            update korisnici
            set ime = %s,
            prezime = %s,
            email = %s,
            rola = %s,
            odobrenje=%s
            where id = %s;
        
            """ 
           vrednosti = (forma['ime'], forma['prezime'], forma['email'], forma['rola'],forma['odobrenje'],id)
           if izvrsi_upit(upit1,vrednosti):
                return jsonify({"message": "Uspešno ste izmenili korisnika."}), 200
        else:
            upit = """
            update korisnici
            set ime = %s,
            prezime = %s,
            email = %s,
            rola = %s,
            odobrenje=%s,
            lozinka = %s
            where id = %s;
        
            """
        
            hash_lozinka = generate_password_hash(forma['lozinka'])
            vrednosti = (forma['ime'], forma['prezime'], forma['email'], forma['rola'],forma['odobrenje'], hash_lozinka,id)
            if izvrsi_upit(upit,vrednosti):
                return jsonify({"message": "Uspešno ste izmenili korisnika."}), 200
     
@app.route('/istorija/<id>', methods=['GET'])
@jwt_required()
@role_required(["administrator"])
def render_istorija(id):
    
    predupit = """
        select ime,prezime from korisnici where id = %s
    """
    
    v=(id, )
    Korisnik = izvrsi_upitData(predupit,v)
    
    upit = """
    select * from istorija_dolazenja where id_korisnika = %s
    """

    istorija = izvrsi_upitData(upit,v)
    
    data = {
        "korisnik": Korisnik,
        "istorija": istorija
    }
    
    
    return jsonify(data),200     
     
     
@app.route('/istorijaGosti', methods=['GET'])
@jwt_required()
@role_required(["administrator"])
def render_istorijaGosti():

    upit = """
    
    select * from guest
    
    """


    istorija = izvrsi_upitData(upit)
    
    
    data = {
        "istorija": istorija
    }
    
    
    return jsonify(data),200   
       

if __name__ == '__main__':
    #app.run(host='0.0.0.0', port=3000, debug=True, threaded=True)  # Pokretanje Flask aplikacije
    serve(app, host='0.0.0.0', port=3000, threads=16,asyncore_use_poll=True,_quiet=True)