import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export function usePersistence<T>(
  key: string,
  initialValue: T,
  firestorePath: string,
  transform?: (data: any) => T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const isLoaded = useRef(false);

  // Auth Listener & Real-time Data Sync
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Cleanup previous snapshot listener if exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        setLoading(true);
        // 🟢 LOGGED IN: Real-time Listener (onSnapshot)
        const docRef = doc(db, 'users', currentUser.uid, 'modules', firestorePath);
        
        unsubscribeSnapshot = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            let fetchedData = snapshot.data();
            // 🛡️ Transform data if migration logic exists
            if (transform) fetchedData = transform(fetchedData);
            
            // ⚡ Update State (Triggers Re-render)
            // Note: We rely on React to handle state diffing. 
            // If the user is typing, there's a small risk of conflict, 
            // but for "Instant Sync" across devices, this is the required pattern.
            setData(fetchedData as T);
          } else {
            // New user or no data: Reset to initial
            setData(initialValue); 
          }
          setLoading(false);
          isLoaded.current = true;
        }, (error) => {
          console.error(`Error listening to ${firestorePath}:`, error);
          setLoading(false);
        });

      } else {
        // ⚪ GUEST: Load from LocalStorage (One-time fetch)
        try {
          const local = localStorage.getItem(key);
          if (local) {
            let parsed = JSON.parse(local);
            if (transform) parsed = transform(parsed);
            setData(parsed as T);
          } else {
            setData(initialValue);
          }
        } catch (err) {
          console.warn(`Error loading local ${key}:`, err);
          setData(initialValue);
        }
        setLoading(false);
        isLoaded.current = true;
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [key, firestorePath]); // Removed initialValue and transform to avoid re-runs

  // Save Listener (Debounced)
  useEffect(() => {
    if (!isLoaded.current) return;

    const handler = setTimeout(async () => {
      if (user) {
        // 🟢 SAVE TO FIRESTORE
        try {
           const docRef = doc(db, 'users', user.uid, 'modules', firestorePath);
           // 🛡️ SANITIZE: Remove undefined values (Firestore doesn't like them)
           const cleanData = JSON.parse(JSON.stringify(data, (k, v) => v === undefined ? null : v)); 
           await setDoc(docRef, cleanData);
        } catch (err) {
           console.error(`Error saving ${firestorePath}:`, err);
        }
      } else {
        // ⚪ SAVE TO LOCALSTORAGE
        localStorage.setItem(key, JSON.stringify(data));
      }
    }, 100); // ⚡ 0.1s debounce (Instant Sync)

    return () => clearTimeout(handler);
  }, [data, user, key, firestorePath]);

  return [data, setData, loading];
}
