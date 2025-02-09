// Utils
const _fetch = async (path, payload = '') => {
    const headers = {
        'X-Requested-With': 'XMLHttpRequest',
    };
    if (payload && !(payload instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(payload);
    }
    const res = await fetch(path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers,
        body: payload,
    });
    if (res.status === 200 || res.status === 201) {
        // Server authentication succeeded
        return res.json();
    } else {
        // Server authentication failed
        const result = await res.json();
        throw result.error;
    }
};

function base64URLToBuffer(base64URL) {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    return Uint8Array.from(atob(base64.padEnd(base64.length + padLen, '=')), c => c.charCodeAt(0));
}
function bufferToBase64URL(buffer) {
    const bytes = new Uint8Array(buffer);
    let string = '';
    bytes.forEach(b => string += String.fromCharCode(b));

    const base64 = btoa(string);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}


/**
 * REGISTER FLOW
 */
const registerStep1 = async () => {
    // Retrieve options from Relying Party (server)
    const opts = {
        attestation: 'none',
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
        }
    };
    await askRelyingParty(opts);
    return await _fetch('/profile/security/devices/add/options', opts);
}

const registerStep2 = async (payload) => {
    // Visual Flow step only : response sent back to browser
    await backToBrowser(payload);

    return payload;
}


const registerStep3 = async (payload) => {
    // Encode retrieved options to fulfill navigator.credentials Api need
    await askAuthenticator(payload);
    payload.user.id = base64URLToBuffer(payload.user.id);
    payload.challenge = base64URLToBuffer(payload.challenge);

    if (payload.excludeCredentials) {
        for (let cred of payload.excludeCredentials) {
            cred.id = base64URLToBuffer(cred.id);
        }
    }

    return payload;
}

const registerStep4 = async (payload) => {
    // Ask for credential creation

    try {
        return  await navigator.credentials.create({
            publicKey: payload,
        });
    } catch (error) {
        alert(error);
        throw error; // stop promise chain
    }
}

const registerStep5 = async (payload) => {
    // Visual Flow step only : response sent back to browser

    await backToBrowser(payload);

    return payload
}


const registerStep6 = async (payload) => {
    // Send authenticator response to relying party
    await askRelyingParty(payload);

    const credential = {};
    credential.id = payload.id;
    credential.rawId = bufferToBase64URL(payload.rawId);
    credential.type = payload.type;

    if (payload.response) {
        const clientDataJSON =
            bufferToBase64URL(payload.response.clientDataJSON);
        const attestationObject =
            bufferToBase64URL(payload.response.attestationObject);
        credential.response = {
            clientDataJSON,
            attestationObject,
        };
    }

    return await _fetch('/profile/security/devices/add', credential);
}

const registerStep7 = async (payload) => {
    // Visual Flow step only : response sent back to browser

    await backToBrowser(payload);

    return payload;
}
const registerStep8 = async (payload) => {
    // this step is only because we display public keys on this page

    document.location.reload();
}

const registerCredential = async () => {
    const promises = [
        registerStep1,
        registerStep2,
        registerStep3,
        registerStep4,
        registerStep5,
        registerStep6,
        registerStep7,
        registerStep8,
    ];
    if (document.getElementById('stepByStep').checked) {
        await promiseChainStepByStep(promises);
    } else {
        await promiseChain(promises);
    }
};

const authenticateStep1 = async () => {
    // Retrieve options from Relying Party (server)
    const opts = {};

    let url = '/assertion/options';
    opts.username = localStorage.getItem("lastLoggedInUserEmail");

    await askRelyingParty(opts);

    return await _fetch(url, opts);
}

const authenticateStep2 = async (payload) => {
    // Visual Flow step only : response sent back to browser
    await backToBrowser(payload);

    return payload;
}

const authenticateStep3 = async (payload) => {
    // Encode retrieved options to fulfill navigator.credentials Api need
    await askAuthenticator(payload);

    if (payload.allowCredentials.length === 0) {
        alert('No registered credentials found.');
        return Promise.resolve(null);
    }

    payload.challenge = base64URLToBuffer(payload.challenge);

    for (let cred of payload.allowCredentials) {
        cred.id = base64URLToBuffer(cred.id);
    }

    return payload;
}

const authenticateStep4 = async (payload) => {
    // Ask for credential creation

    try {
        return  await navigator.credentials.get({
            publicKey: payload,
        });
    } catch (error) {
        alert(error);
        throw error; // stop promise chain
    }
}

const authenticateStep5 = async (payload) => {
    // Visual Flow step only : response sent back to browser

    await backToBrowser(payload);

    return payload
}

const authenticateStep6 = async (payload) => {
    // Send authenticator response to relying party
    await askRelyingParty(payload);

    const credential = {};
    credential.id = payload.id;
    credential.type = payload.type;
    credential.rawId = bufferToBase64URL(payload.rawId);

    if (payload.response) {
        const clientDataJSON =
            bufferToBase64URL(payload.response.clientDataJSON);
        const authenticatorData =
            bufferToBase64URL(payload.response.authenticatorData);
        const signature =
            bufferToBase64URL(payload.response.signature);
        const userHandle =
            bufferToBase64URL(payload.response.userHandle);
        credential.response = {
            clientDataJSON,
            authenticatorData,
            signature,
            userHandle,
        };
    }

    try {
        return await _fetch(`/assertion/result`, credential);
    } catch (error) {
        alert(error);
    }
}

const authenticateStep7 = async (payload) => {
    // Visual Flow step only : response sent back to browser

    await backToBrowser(payload);

    return payload;
}
const authenticateStep8 = async (payload) => {
    // redirect to show app since we now are logged in

    document.location = '/';
}

const authenticate = async () => {
    const promises = [
        authenticateStep1,
        authenticateStep2,
        authenticateStep3,
        authenticateStep4,
        authenticateStep5,
        authenticateStep6,
        authenticateStep7,
        authenticateStep8,
    ];
    if (document.getElementById('stepByStep').checked) {
        await promiseChainStepByStep(promises);
    } else {
        await promiseChain(promises);
    }
};
