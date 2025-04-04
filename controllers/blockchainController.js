const express = require('express');
const Blockchain = require('../models/Blockchain');
const Transaction = require('../models/Transaction');
const path = require("path");
const fs = require("fs");
const crypto = require('crypto');
const imageModel = require('../models/imageModel');
const multer = require('multer');
const DigitalSignature = require('../models/DigitalSignature');


const router = express.Router();
const blockchain = new Blockchain();

router.get('/', (req, res) => {
    const chain = blockchain.getChain();
    const discrepancies = blockchain.verifyChain();
    res.render('index', { 
        chain: chain,
        pendingTransactions: blockchain.pendingTransactions, // Truyền danh sách transaction đang chờ
        discrepancies: discrepancies
    });
});

router.post('/addTransaction', (req, res) => {
    const { employeeId, bookId, studentId, borowed_date, return_date, cost} = req.body;
    const transaction = new Transaction(employeeId, bookId, studentId, borowed_date, return_date, cost);
    blockchain.addTransaction(transaction);
    res.redirect('/');
});

router.get('/file', (req, res) => {
    const filePath = path.join(__dirname, "../data/blockchain.json"); // Đường dẫn đến file JSON

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Không thể đọc file JSON" });
        }
        res.setHeader("Content-Type", "application/json");
        res.send(data);
    });
});


router.get("/encrypt", (req, res) => {
    res.render("encrypt")
})

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Độ dài khóa (2048 bit là tiêu chuẩn)
});
router.post("/encrypt", (req, res) =>{
    const message = req.body.message;
    const encryptedMessage = crypto.publicEncrypt(publicKey, Buffer.from(message))
    // Trả lại kết quả mã hóa cho người dùng
    res.render("encrypt.pug", {
        message : message,
        encryptedMessage : encryptedMessage.toString('base64')
    })
})
router.post("/decrypt", (req, res) => {
    const encryptedData = req.body.encryptedData;

  // Giải mã thông điệp bằng privateKey
  try {
    // Chuyển dữ liệu Base64 thành Buffer
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');

    // Giải mã thông điệp bằng privateKey
    const decryptedMessage = crypto.privateDecrypt(
      privateKey,
      encryptedBuffer
    );

    // Render lại trang với kết quả giải mã
    res.render('encrypt', {
        encryptedData:encryptedData,
        decryptedMessage: decryptedMessage.toString()  // Trả về thông điệp đã giải mã
    });
  } catch (error) {
    res.render('encrypt', {
      decryptedMessage: 'Lỗi: Dữ liệu mã hóa không hợp lệ hoặc không thể giải mã.'
    });
  }
    // res.send("OK")
})


// Chữ kí số
router.get('/signature', (req, res) => {
    res.render('signature');
});

router.post('/sign', (req, res) => {
    const data = req.body.data;
    const hash = DigitalSignature.hashData(data);
    const signature = DigitalSignature.sign(data, privateKey);
    res.render('signature', { data, hash, signature, verified: null });
});

router.post('/verify', (req, res) => {
    const data = req.body.data;
    const signature = req.body.signature;
    const verified = DigitalSignature.verify(data, signature, publicKey);
    res.render('signature', { data, hash: DigitalSignature.hashData(data), signature, verified });
});


module.exports = router;