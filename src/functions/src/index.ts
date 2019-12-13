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
