# Schritt 2: Implementierung von ggt
Mit Cloud-Funktionen von Firebase kann man automatisch Back-End-Code als Reaktion auf Ereignisse ausführen, die durch Firebase-Funktionen und HTTPS-Anfragen ausgelöst werden. Der Code wird in der Google-Cloud gespeichert und in einer verwalteten Umgebung, die automatisch skaliert, ausgeführt.

Die Google Funktionen können durch die  unterschiedlichen Ereignisse ausgefürt werden. In diesem Schritt beschäftigen wir uns nur mit dem HTTP-Triggers.

Eine HTTPS Funktion wird als Folgendes implementiert:
```
exports.date = functions.https.onRequest((req, res) => {
  // ...
});
```

## Implementierung von ggT cloud Funktion

### /ggT API:

Dieser API nimmt zwei Zahlen als Eingaben, berechnet den größten gemeinsamen Teiler , speichert die Historie der Berechnung in der Google Firestore DB und gibt das Ergebnis an den Client zurück.

Wir implementieren eine cloud Function in der index.ts Datei mit dem folgenden Struktur:

```
export const ggt = functions.https.onRequest(async (request, response)  => {
  ...
}
```
Nach dem Deplyment ist die Funktion unter dem folgenden URL erreichbar:

```
https://<region>-<project-id>.cloudfunctions.net/ggt
// https://us-central1-fhsample-dev.cloudfunctions.net/ggt
```

Die vollständige Implementierung ist Folgendes:
```
import * as functions from 'firebase-functions';
import *  as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

function ggtBerechnen(z1:number, z2:number) :number{
  let x = Math.abs(z1);
  let y = Math.abs(z2);
  while(y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

async function  writeDB(z1:number, z2:number, result:number) {
  const docRef = db.collection('history').doc();
  await docRef.set({
  zahl1: z1,
    zahl2: z2,
    ergebnis: result,
    datetime: Date.now()
  });
}


export const ggt = functions.https.onRequest(async (request, response)  => {
  const path: string[] = request.path.split('/');
  if(path.length > 3) {
    response.status(400).send("Nur zwei Parameter in Path sind erlaubt");
  } else if(path.length < 3) {
    response.status(400).send("Bitte geben Sie Zwei Zahlen als Path parameter ein, z.B /Zahl1/Zahl2 :");
  } else {
    const a:number = +path[1];
    const b:number = +path[2];
    if(Number.isNaN(a)) {
      response.status(400).send("Der erste Parameter ist keine Zahl!");
    } else if(Number.isNaN(b)) {
      response.status(400).send("Der zweite Parameter ist keine Zahl!");
    } else {
      const result =  ggtBerechnen(a, b);
      await writeDB(a,b,result);
      response.send("Größter gemeinsamer Teiler von " + a + " und " + b + " ist " + result );
    }
  }
});
```
Die Funktion **ggtBerechnen** nimmt zwei Zahlen und berechnet den gerößten gemeinsamen Teiler als Ergebnis und die Funktion **writeDB** schreibt die Eingaben und das Ergebnis in die Firestore-Datenbank als Historie der Berechnung.

### /ggt_history API
Liest die Historie der allen Methodenaufrufen von /ggt API aus der Firestore-Datenbank und gibt sie als Ergebnis zurück.
```
export const ggt_history = functions.https.onRequest(async (request, response) => {
  const historiesRef = db.collection('history').orderBy('datetime', 'desc').limit(10);
  const allHistories = await historiesRef.get()
    .then(snapshot => {
      let allDocs: any[] = [];
      snapshot.forEach(doc => {
        const h = {
          zahl1: doc.data()['zahl1'],
          zahl2: doc.data()['zahl2'],
          ergebnis: doc.data()['ergebnis'],
          date: new Date(doc.data()['datetime'])
        }
        allDocs.push(h);
      });
      return allDocs;
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
    response.send(allHistories );
});
```
