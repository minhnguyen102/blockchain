class Block {
    constructor(index, previousHash, timestamp, transactions, hash, merkleRoot) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = hash;
        this.merkleRoot = merkleRoot    
    }
}

module.exports = Block;