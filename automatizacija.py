import subprocess
import time
import os
import signal
import psutil

# Putanja do foldera sajta i Flask aplikacije
FLASK_APP_PATH = r"C:\Users\Win10senzori\Desktop\Samsung Apps Lab\pametna brava server\app.py"
FLASK_PORT = 3000  # Ako koristiš drugi port, promeni ovde

def kill_process_on_port(port):
    """Pronalazi i gasi procese koji koriste dati port."""
    for proc in psutil.process_iter(attrs=['pid', 'name']):  # <-- Uklonjen 'connections'
        try:
            for conn in proc.connections(kind='inet'):  # <-- Ispravan način dobijanja konekcija
                if conn.laddr.port == port:
                    print(f"Ubija proces {proc.info['name']} na portu {port} (PID: {proc.info['pid']})")
                    proc.terminate()
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

def kill_old_processes():
    """Gasi sve prethodne instance HTTP servera i Flask aplikacije."""
    print("Tražim i gasim stare procese...")
    kill_process_on_port(FLASK_PORT)
    time.sleep(2)  # Čeka malo da se procesi ugase

def start_flask_app():
    """Pokreće Flask aplikaciju (app.py)."""
    return subprocess.Popen(["python", FLASK_APP_PATH], 
                            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)

def restart_every_8_hours():
    """Pokreće i restartuje HTTP server i Flask aplikaciju na svakih 8 sati."""
    while True:
        print("Gasim prethodne procese...")
        kill_old_processes()

        print("Pokrećem Flask aplikaciju...")
        flask_process = start_flask_app()

        try:
            time.sleep(8 * 60* 60)
            
        except KeyboardInterrupt:
            print("Ručni prekid, gasim server i Flask aplikaciju.")
            flask_process.terminate()
            break

        print("Restartujem server i Flask aplikaciju...")

if __name__ == "__main__":
    restart_every_8_hours()