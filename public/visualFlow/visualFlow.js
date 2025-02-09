let currentActor = 'browser';
let nextActor = null;

const stepTime= 2000;

const start = () => {
    currentActor = 'browser';
    render();
}

const askRelyingParty = async (payload) => {
    document.getElementById('payloadContent').innerHTML = JSON.stringify(payload, null, 2);
    await setNextActor('relyingParty');
}

const askAuthenticator = async (payload) => {
    document.getElementById('payloadContent').innerHTML = JSON.stringify(payload, null, 2);
    await setNextActor('authenticator');
}

const backToBrowser = async (responsePayload) => {
    document.getElementById('payloadContent').innerHTML = JSON.stringify(responsePayload, null, 2);
    await setNextActor('browser');
}

const setNextActor = (next) => {
    nextActor = next;
    render();
    return new Promise((resolve) => {
        setTimeout(
            () => {
                currentActor = nextActor;
                nextActor = null;
                render();
                resolve();
            },
            stepTime
        );
    })
}

const render = () => {
    if (nextActor) {
        document.getElementById('visualFlow').className = `${currentActor}-to-${nextActor}`;
    } else {
        document.getElementById('visualFlow').className = `on-${currentActor}`;
    }
}

ready(() => {
    start();
});



const promiseChain = (promises, initialValue) => {
    return promises.reduce((prevPromise, currentPromise) => {
        return prevPromise.then(currentPromise);
    }, Promise.resolve(initialValue));
};

const waitForClick = () => {
    return new Promise((resolve) => {
        const button = document.getElementById("stepByStepNextButton");
        const handler = () => {
            button.removeEventListener("click", handler);
            resolve();
        };
        button.addEventListener("click", handler);
    });
};

const promiseChainStepByStep = async (promises, initialValue) => {
    let result = await promises[0](initialValue);

    for (let i = 1; i < promises.length; i++) {
        await waitForClick(); // Attente du clic avant chaque exécution
        result = await promises[i](result);
        console.log("Résultat après exécution :", result);
    }

    console.log("Toutes les tâches sont terminées !");
};
