class Transaction {
    constructor(employeeId, bookId, studentId, borowed_date, return_date, cost) {
        this.employeeId = employeeId;
        this.bookId = bookId;
        this.studentId = studentId;
        this.borowed_date = borowed_date;
        this.return_date = return_date;
        this.cost = cost;
    }
}

module.exports = Transaction;