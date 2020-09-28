const arweave = Arweave.init();

let key = null;
let address = null;
let currentTransaction = null;
let binaryFile = null;
let searchResult = null;

FileReaderJS.setupDrop(document.getElementById('wallet-dropzone'), {
    readAsDefault: "DataURL",
    on: {
        load: function(e, file) {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                addWallet(reader.result)
            }
            reader.readAsText(file)
        }
    }
});

FileReaderJS.setupDrop(document.getElementById('image-dropzone'), {
    readAsDefault: "DataURL",
    on: {
        load: function(e, file) {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {
                binaryFile = new Uint8Array(reader.result);
                console.log(binaryFile);
            }
            reader.readAsArrayBuffer(file)
        }
    }
});

const createNewWallet = () => {
    arweave.wallets.generate().then((k) => {
        key = k;
        updateAddress(key);
    });
};

const addWallet = (jsonData) => {
    key = JSON.parse(jsonData);
    updateAddress(key);
}

const updateAddress = (key) => {
    arweave.wallets.jwkToAddress(key).then((addr) => {
        address = addr
        document.querySelector(`[data-binding='key']`).innerText = address;
        arweave.wallets.getBalance(address).then((balance) => {
            document.querySelector(`[data-binding='balance']`).innerText = arweave.ar.winstonToAr(balance);
        });
    });
}

const createDataTransaction = async (dataType) => {
    if (dataType === 'content') {
        currentTransaction = await arweave.createTransaction({
            data: document.querySelector(`[name='content-data']`).value,
        }, key);
        currentTransaction.addTag('Content-Type', 'application/text');
    }

    if (dataType === 'image') {
        currentTransaction = await arweave.createTransaction({
            data: binaryFile,
        }, key);
        currentTransaction.addTag('Content-Type', 'image/jpg');
    }

    currentTransaction.addTag('type', 'eddie-test');
    renderTransactionInfo(currentTransaction);

    console.log(currentTransaction);
}

const signTransaction = async () => {
    await arweave.transactions.sign(currentTransaction, key);
    renderTransactionInfo(currentTransaction);

    console.log(currentTransaction);
}

const submitTransaction = async () => {
    const response = await arweave.transactions.post(currentTransaction);

    console.log(response.status);
}

const renderTransactionInfo = (transaction) => {
    document.querySelector(`[data-binding='transaction-id']`).innerText = transaction.id;
    document.querySelector(`[data-binding='transaction-fee']`).innerText = transaction.reward;
    document.querySelector(`[data-binding='transaction-data-root']`).innerText = transaction.data_root;
}

const getTransactionData = () => {
    arweave.transactions.getData(document.querySelector(`[name='transaction-id']`).value, {decode: true, string: true}).then(data => {
        document.querySelector(`[data-binding='transaction-data']`).innerText = data;

        console.log(data);
    });
}

const searchData = async () => {
    searchResult = await arweave.arql({
        op: "equals",
        expr1: "type",
        expr2: "eddie-test"
    });
    console.log(searchResult);
    renderSearchResult();
}

const renderSearchResult = () => {
    document.querySelector(`[data-binding='search-result']`).innerHTML = '';
    searchResult.forEach(id => {
        const node = document.createElement('li');
        const textnode = document.createTextNode(id);
        node.appendChild(textnode);
        document.querySelector(`[data-binding='search-result']`).appendChild(node);
    })
}
