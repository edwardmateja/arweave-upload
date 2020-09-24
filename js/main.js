const arweave = Arweave.init();

let key = null;

FileReaderJS.setupDrop(document.getElementById('dropzone'), {
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

const createNewWallet = () => {
    arweave.wallets.generate().then((k) => {
        key = k;
        showAddress(key);
    });
};

const addWallet = (jsonData) => {
    key = JSON.parse(jsonData);
    showAddress(key);
}

const showAddress = (key) => {
    arweave.wallets.jwkToAddress(key).then((address) => {
        document.querySelector(`[data-binding='key']`).innerText = address;
    });
}
