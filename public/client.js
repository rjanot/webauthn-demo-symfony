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
    if (res.status === 200) {
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



const registerCredential = async () => {
    const opts = {
        attestation: 'none',
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
        }
    };
    const options = await _fetch('/profile/security/devices/add/options', opts);

    options.user.id = base64URLToBuffer(options.user.id);
    options.challenge = base64URLToBuffer(options.challenge);

    if (options.excludeCredentials) {
        for (let cred of options.excludeCredentials) {
            cred.id = base64URLToBuffer(cred.id);
        }
    }

    console.log(`const cred = await navigator.credentials.create({
        publicKey: options,
    });`)
    console.log(options);

    const cred = await navigator.credentials.create({
        publicKey: options,
    });

    const credential = {};
    credential.id = cred.id;
    credential.rawId = bufferToBase64URL(cred.rawId);
    credential.type = cred.type;

    if (cred.response) {
        const clientDataJSON =
            bufferToBase64URL(cred.response.clientDataJSON);
        const attestationObject =
            bufferToBase64URL(cred.response.attestationObject);
        credential.response = {
            clientDataJSON,
            attestationObject,
        };
    }

    localStorage.setItem(`credId`, credential.id);

    const toReturn = await _fetch('/profile/security/devices/add', credential);
    console.log('await _fetch(\'/profile/security/devices/add\', credential)', toReturn);

    return toReturn;
};

const authenticate = async () => {
    const opts = {};

    let url = '/auth/signinRequest';
    const credId = localStorage.getItem(`credId`);
    if (credId) {
        url += `?credId=${encodeURIComponent(credId)}`;
    }

    const options = await _fetch(url, opts);

    if (options.allowCredentials.length === 0) {
        console.info('No registered credentials found.');
        return Promise.resolve(null);
    }

    options.challenge = base64url.decode(options.challenge);

    for (let cred of options.allowCredentials) {
        cred.id = base64url.decode(cred.id);
    }

    const cred = await navigator.credentials.get({
        publicKey: options,
    });

    const credential = {};
    credential.id = cred.id;
    credential.type = cred.type;
    credential.rawId = base64url.encode(cred.rawId);

    if (cred.response) {
        const clientDataJSON =
            base64url.encode(cred.response.clientDataJSON);
        const authenticatorData =
            base64url.encode(cred.response.authenticatorData);
        const signature =
            base64url.encode(cred.response.signature);
        const userHandle =
            base64url.encode(cred.response.userHandle);
        credential.response = {
            clientDataJSON,
            authenticatorData,
            signature,
            userHandle,
        };
    }

    return await _fetch(`/auth/signinResponse`, credential);
};

const unregisterCredential = async (credId) => {
    localStorage.removeItem('credId');
    return _fetch(`/auth/removeKey?credId=${encodeURIComponent(credId)}`);
};
