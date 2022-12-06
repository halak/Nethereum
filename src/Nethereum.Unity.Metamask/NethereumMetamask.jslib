mergeInto(LibraryManager.library, {
    EnableEthereum: function (gameObjectName, callback, fallback) {
        const parsedObjectName = UTF8ToString(gameObjectName);
        const parsedCallback = UTF8ToString(callback);
        const parsedFallback = UTF8ToString(fallback);

        return ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            ethereum.autoRefreshOnNetworkChange = false;

            nethereumUnityInstance.SendMessage(parsedObjectName, parsedCallback, accounts[0]);
        }).catch(function (error) {
            nethereumUnityInstance.SendMessage(parsedObjectName, parsedFallback, error.message);
        });
    },
    EthereumInit: function(gameObjectName, callBackAccountChange, callBackChainChange){
        const parsedObjectName = UTF8ToString(gameObjectName);
        const parsedCallbackAccountChange = UTF8ToString(callBackAccountChange);
        const parsedCallbackChainChange = UTF8ToString(callBackChainChange);

        ethereum.on("accountsChanged", function (accounts) {
            var account = "";
            if (accounts[0] !== undefined){
                account = accounts[0];
            }
            nethereumUnityInstance.SendMessage(parsedObjectName, parsedCallbackAccountChange, account);
        });
        ethereum.on("chainChanged", function (chainId) {
            nethereumUnityInstance.SendMessage(parsedObjectName, parsedCallbackChainChange, chainId.toString());
        });
    },
    GetChainId: function(gameObjectName, callback, fallback) {
        const parsedObjectName = UTF8ToString(gameObjectName);
        const parsedCallback = UTF8ToString(callback);
        const parsedFallback = UTF8ToString(fallback);

        return ethereum.request({ method: 'eth_chainId' }).then(function (chainId) {
            nethereumUnityInstance.SendMessage(parsedObjectName, parsedCallback, chainId.toString());
        }).catch(function (error) {
            nethereumUnityInstance.SendMessage(parsedObjectName, parsedFallback, error.message);
        });
    },
    IsMetamaskAvailable: function () {
        if (window.ethereum) return true;
        return false;
    },
    GetSelectedAddress: function () {
        var returnValue = ethereum.selectedAddress;
        if (returnValue !== null) {
            var bufferSize = lengthBytesUTF8(returnValue) + 1;
            var buffer = _malloc(bufferSize);
            stringToUTF8(returnValue, buffer, bufferSize);
            return buffer;
        } else {
            return null;
        }
    },
    Request: function (message, gameObjectName, callback, fallback) {
        const parsedMessageStr = UTF8ToString(message);
        const parsedObjectName = UTF8ToString(gameObjectName);
        const parsedCallback = UTF8ToString(callback);
        const parsedFallback = UTF8ToString(fallback);
        const parsedMessage = JSON.parse(parsedMessageStr);

        return ethereum.request(parsedMessage).then(function (response) {
            const rpcResponse = {
                jsonrpc: "2.0",
                result: response,
                id: parsedMessage.id,
                error: null
            };
            const json = JSON.stringify(rpcResponse);
            nethereumUnityInstance.SendMessage(parsedObjectName, parsedCallback, json);
        }).catch(function (e) {
            const rpcResonseError = {
                jsonrpc: "2.0",
                id: parsedMessage.id,
                error: {
                    message: e.message,
                }
            }
            const json =  JSON.stringify(rpcResonseError);
            nethereumUnityInstance.SendMessage(parsedObjectName, parsedFallback, json);
        });
    },
    RequestRpcClientCallback: function (callback, message) {
        const parsedMessageStr = UTF8ToString(message);
        const parsedMessage = JSON.parse(parsedMessageStr);

        return ethereum.request(parsedMessage).then(function (response) {
            const rpcResponse = {
                jsonrpc: "2.0",
                result: response,
                id: parsedMessage.id,
                error: null
            }
            const json = JSON.stringify(rpcResponse);
            const bufferSize = lengthBytesUTF8(json) + 1;
            const buffer = _malloc(bufferSize);
            stringToUTF8(json, buffer, bufferSize);
            Module.dynCall_vi(callback, buffer);
        }).catch(function (e) {
            const rpcResonseError = {
                jsonrpc: "2.0",
                id: parsedMessage.id,
                error: {
                    message: e.message,
                }
            }
            const json = JSON.stringify(rpcResonseError);
            const bufferSize = lengthBytesUTF8(json) + 1;
            const buffer = _malloc(bufferSize);
            stringToUTF8(json, buffer, bufferSize);
            Module.dynCall_vi(callback, buffer);
        });
    }
});
