import * as functions from 'firebase-functions';
import *  as admin from 'firebase-admin';
// Imports the Google Cloud client library
import {PubSub} from '@google-cloud/pubsub';
//
// // Creates a client
const pubsub = new PubSub();
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

export const publisher = functions.https.onRequest(async (request, response) => {
  const path = request.path;
  if(!path) {
    response.status(400).send("Keine Daten");
  } else {
    const topicName = 'my-topic';
     const data = JSON.stringify({ nachricht: path });

  //  Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    const dataBuffer = Buffer.from(data);

    const messageId = await pubsub.topic(topicName).publish(dataBuffer);

    console.log(`Message ${messageId} published.`);
    response.send('OK');
  }
});

exports.subscriber = functions.pubsub.topic('my-topic').onPublish(async (message) => {
    console.log(`Message ${message.json.nachricht} received.`);
    const docRef = db.collection('nachrichten').doc();
    await docRef.set({
      nachricht: message.json.nachricht,
      datetime: Date.now()
    });
    return;
});

export const processed = functions.https.onRequest(async (request, response) => {
  const historiesRef = db.collection('nachrichten').orderBy('datetime', 'desc').limit(10);
  const allHistories = await historiesRef.get()
    .then(snapshot => {
      let allDocs: any[] = [];
      snapshot.forEach(doc => {
        const h = {
          nachricht: doc.data()['nachricht'],
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
