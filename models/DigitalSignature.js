const crypto = require('crypto');

class DigitalSignature {
    static hashData(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    static sign(data, privateKey) {
        const hash = this.hashData(data);
        const sign = crypto.createSign('SHA256');
        sign.update(hash);
        sign.end();
        return sign.sign(privateKey, 'base64');
    }

    static verify(data, signature, publicKey) {
        const hash = this.hashData(data);
        const verify = crypto.createVerify('SHA256');
        verify.update(hash);
        verify.end();
        return verify.verify(publicKey, signature, 'base64');
    }
}

module.exports = DigitalSignature;