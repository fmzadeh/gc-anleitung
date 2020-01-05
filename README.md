# Ziel

Das Zeil dieses Projekt ist die funktionale und nachrichten basierte Etwicklung auf Google cloud mit einfache Beispiele zu Zeigen.

# Technologien
Die folgende Technologien werden genutz:

### Google Cloud Functions
Cloud Functions ist eine cloud-basierte und skalierbare Node.js-Umgebung, in der  JavaScript-Code als eigenstaendige Funktionen  deployert und ausgefürt werden können. Mit ein Paar Beispiele wird gezeigt wie JavaScript Funktionen durch HTTP Anfragen oder andere Art von Events ausgefürt werden.
[Google Cloud Functions](https://cloud.google.com/functions/)

### Cloud Firestore
Als verteilte, skalierbare NoSQL-Datenbank wird Cloud Firestore für die Speicherung und Synchronisierung von App-Daten für mobile und Web-Applikationen verwendet. [Google Firestore](https://cloud.google.com/firestore/)

### Cloud Pub/Sub
 Cloud Pub/Sub bringt die Flexibilität und Zuverlässigkeit von nachrichtenorientierter Middleware in die Cloud. Mit einem Beispiel wir gezeigt wie Zwei Funktionen durch google Pub/Sub mit einander kommunizieren. [Google Cloud Pub/Sub](https://cloud.google.com/pubsub/)

# Vorgehensweise
Alle Schritte werden detailiert dokumentiert werden.

### [Schritt 1: Projekt Setup](schritt1.md)
- Setup von Google Cloud Projekt auf Google Cloud Console (Projekt anlegen, Sicherheitskonfiguration etc.)
- Setup von Entwicklungsumgebung auf dem Laptop ( Setup von Nodejs und Typescript, google cloud sdk etc.)

### [Schritt 2: Implementierung von Ggt](schritt2.md)
Hier werden zwei Funktionen implementiert die jeweils als eine API exponiert werden:
- **/ggt API**: Dieser API nimmt Zwei Zahlen als Eingaben, berechnet den grössten gemeinsamen Teiler , speichert die Historie der Berechnung in der Google Firestore DB und gibt das Ergebniss zurueck an den Client.

- **/ggt/history API**: Gibt die Historie alle Methodenaufrufe von /ggt API zurueck.

### [Schritt 3: Nachrichten durch  Pub/Sub](schritt3.md)
In diesem Schritt werden drei Funktionen implementiert.
- **/publisher**: Dieser API bekommt einen Text als Eingabe und schreibt ihn als eine Nachricht in den Topic testtopic ins Pub/Sub System.
- **subscriber**: subscribiert sich an testtopic, bekommt die Nachrichten und schribt sie in die datenbank.
- **/processed** API: Gibt alle bearbeiteten Nachrichten zurück.
