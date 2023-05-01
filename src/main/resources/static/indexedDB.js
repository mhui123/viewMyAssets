let db, dbObj = new Object();
document.addEventListener('DOMContentLoaded', function(){
    idxdb.initIdxDB();
})

idxdb = {
    initIdxDB : function(){
        const DBOpenRequest = window.indexedDB.open('testDB', 1);

        DBOpenRequest.onerror = (event) => {
            console.log('Error loading database.');
        };

        DBOpenRequest.onsuccess = (event) => {
            console.log('Database initialised.');

            db = DBOpenRequest.result;
            idxdb.connectDB('select');
        };

        DBOpenRequest.onupgradeneeded = (event) => {
            db = event.target.result;

            db.onerror = (event) => {
            console.log('Error loading database.');
            };

            const objectStore = db.createObjectStore('testTable', { keyPath: 'pk' });
            objectStore.createIndex('test', 'test', { unique: false });
        };
    },

    connectDB : function(keyword){
        const transaction = db.transaction(['testTable'], 'readwrite');
        transaction.oncomplete = () => {console.log('Transaction completed: database modification finished.');};
        transaction.onerror = () => { console.log(`Transaction not opened due to error: ${transaction.error}`);};
        const objectStore = transaction.objectStore('testTable');
        
        if(keyword.includes('add')){
          const newItem = [
            { pk: Date.now(), test: "test"},
          ];
          const objectStoreRequest = objectStore.add(newItem[0]);
          objectStoreRequest.onsuccess = (event) => {
            console.log('insert Request successful.');
          };
  
        } else if(keyword.includes('update')){
          let key = Number(Object.keys(dbObj)[0]); //첫번째 row;
          let tg = objectStore.get(key);
          tg.onsuccess = e => {
            let toUpdate = e.target.result;
            toUpdate.test = new Date().toLocaleString('ko-KR');
            const updateRequest = objectStore.put(toUpdate);
  
            updateRequest.onsuccess = e => {
                console.log("update complete");
            }
          };
        } else if(keyword.includes('select')){
            const objectStore = db.transaction('testTable').objectStore('testTable');
      
            objectStore.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (!cursor) {
                console.log('Entries all displayed.');
                return;
                }
                const { test, pk } = cursor.value;

                dbObj[pk] = cursor.value;
                cursor.continue();
            };
        } else {
            const key = Number(Object.keys(dbObj)[0]); //첫번째 row;
            objectStore.delete(key);
            transaction.oncomplete = () => {
                console.log("1번째 row 삭제완료");
            };
        }
      },
}