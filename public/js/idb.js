let db;
const request = window.indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  store = db.createObjectStore('budget_tracker', {
    autoIncrement: true
  });
}

request.onerror = function(e) {
  console.log(e.target.errorCode);
}

request.onsuccess = function(e) {
  db = e.target.result;

  if (navigator.onLine) {
    uploadTransactions();
  }
}

function saveRecord(record) {
  const transaction = db.transaction(['budget_tracker'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('budget_tracker');

  // add record to your store with add method.
  budgetObjectStore.add(record);
}

function uploadTransactions() {
  const transaction = db.transaction('budget_tracker', 'readwrite');

  const budgetObjectStore = transaction.objectStore('budget_tracker');

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) [
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(response => {
        if (response.message) {
          throw new Error(response);
        }

        const transaction = db.transaction('budget_tracker', 'readwrite');

        const budgetObjectStore = transaction.objectStore('budget_tracker');

        budgetObjectStore.clear();
      }).catch(err => {
        console.log(err);
      })
    ]
  }
}

window.addEventListener('online', uploadTransactions);

