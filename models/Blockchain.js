const crypto = require('crypto');
const Block = require('./Block');
const fs = require('fs');
const path = require('path');

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.loadChain();
    }

    loadChain() {
        const filePath = path.join(__dirname, '../data/blockchain.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            this.chain = JSON.parse(data);
        } else {
            this.createGenesisBlock();
        }
    }

    saveChain() {
        const filePath = path.join(__dirname, '../data/blockchain.json');
        fs.writeFileSync(filePath, JSON.stringify(this.chain, null, 2));
    }

    createGenesisBlock() {
        const genesisBlock = new Block(0, '0', Date.now(), [], this.hashBlock('0', [], Date.now()), "");
        this.chain.push(genesisBlock);
        this.saveChain();
    }

    hashBlock(previousHash, transactions, timestamp) {
        const data = previousHash + JSON.stringify(transactions) + timestamp;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    addTransaction(transaction) {
        this.pendingTransactions.push(transaction);
        if (this.pendingTransactions.length >= 5) {
            this.mineBlock();
        }
    }

    mineBlock() {
        const lastBlock = this.chain[this.chain.length - 1];
        const transactionsToHash = this.pendingTransactions.slice(0, 5);
        const newBlock = new Block(
            this.chain.length,
            lastBlock.hash,
            Date.now(),
            this.pendingTransactions,
            this.hashBlock(lastBlock.hash, this.pendingTransactions, Date.now()),
            this.calculateMerkleRoot(transactionsToHash)
        );
        this.chain.push(newBlock);
        this.pendingTransactions = [];
        this.saveChain();
    }

    calculateMerkleRoot(transactions) {
        if (transactions.length === 0) return '';
        let merkleTree = transactions.map(tx => crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex'));
        while (merkleTree.length > 1) {
            if (merkleTree.length % 2 !== 0) {
                merkleTree.push(merkleTree[merkleTree.length - 1]);
            }
            const newLevel = [];
            for (let i = 0; i < merkleTree.length; i += 2) {
                const combinedHash = merkleTree[i] + merkleTree[i + 1];
                newLevel.push(crypto.createHash('sha256').update(combinedHash).digest('hex'));
            }
            merkleTree = newLevel;
        }
        return merkleTree[0];
    }

    getChain() {
        return this.chain;
    }

    verifyChain() {
        const discrepancies = [];
        for (let i = 0; i < this.chain.length; i++) {
            const block = this.chain[i];

            if (block.index === 0) continue; // Skip genesis block

            // Verify Merkle Root
            const calculatedMerkleRoot = this.calculateMerkleRoot(block.transactions);
            if (block.merkleRoot !== calculatedMerkleRoot) {
                discrepancies.push({
                    index: block.index,
                    type: 'merkleRoot',
                    original: block.merkleRoot,
                    calculated: calculatedMerkleRoot
                });
            }

            // Verify Block Hash
            const calculatedHash = this.hashBlock(block.previousHash, block.transactions, block.timestamp);
            if (block.hash !== calculatedHash) {
                discrepancies.push({
                    index: block.index,
                    type: 'blockHash',
                    original: block.hash,
                    calculated: calculatedHash
                });
            }

            // Verify Previous Hash
            if (i > 0 && block.previousHash !== this.chain[i - 1].hash) {
                discrepancies.push({
                    index: block.index,
                    type: 'previousHash',
                    original: block.previousHash,
                    calculated: this.chain[i - 1].hash
                });
            }

            // Verify Index
            if (block.index !== i) {
                discrepancies.push({
                    index: block.index,
                    type: 'index',
                    original: block.index,
                    expected: i
                });
            }
        }

        // Check for missing blocks
        for (let i = 1; i < this.chain.length; i++) {
            if (this.chain[i].index !== i) {
                discrepancies.push({
                    index: i,
                    type: 'missingBlock',
                    expected: `Block at index ${i} is missing`
                });
            }
        }

        // Check if the last block is missing
        if (this.chain.length > 1 && this.chain[this.chain.length - 1].index !== this.chain.length - 1) {
            discrepancies.push({
                index: this.chain.length - 1,
                type: 'missingLastBlock',
                expected: `Last block at index ${this.chain.length - 1} is missing`
            });
        }

        return discrepancies;
    }
}

module.exports = Blockchain;