import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB72on7CtYDkyuhWgSFVgZ2idoRlS-yzO0",
  authDomain: "rural-tech-eddd2.firebaseapp.com",
  databaseURL: "https://rural-tech-eddd2-default-rtdb.firebaseio.com/",
  projectId: "rural-tech-eddd2",
  storageBucket: "rural-tech-eddd2.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, onValue, push, remove };
