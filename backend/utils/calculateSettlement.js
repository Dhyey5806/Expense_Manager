export default function calc(arr) {
    const userSpendings = {};

    for (const expense of arr) {
        const payerEmail = expense.paidBy.mail;
        const amountPaid = expense.amount;

        if (!userSpendings[payerEmail]) {
            userSpendings[payerEmail] = { name: expense.paidBy.name, mail: payerEmail, paid: 0, total_spent: 0 };
        }
        userSpendings[payerEmail].paid += amountPaid;

        for (const split of expense.splits) {
            const userEmail = split.mail;
            const splitAmount = split.amount;

            if (!userSpendings[userEmail]) {
                userSpendings[userEmail] = { name: split.name, mail: userEmail, paid: 0, total_spent: 0 };
            }
            userSpendings[userEmail].total_spent += splitAmount;
        }
    }

    const netBalances = [];

    for (const email in userSpendings) {
        const user = userSpendings[email];
        const net = user.paid - user.total_spent;

        if (net !== 0) {
            netBalances.push({ name: user.name, mail: user.mail, amount: net });
        }
    }

    const givers = []; // owe money (amount < 0)
    const receivers = []; // to receive money (amount > 0)

    for (const person of netBalances) {
        if (person.amount < 0) {
            givers.push({ ...person });
        } else if (person.amount > 0) {
            receivers.push({ ...person });
        }
    }

    const settlements = [];

    while (givers.length > 0 && receivers.length > 0) {
        givers.sort((a, b) => a.amount - b.amount); // most negative first
        receivers.sort((a, b) => b.amount - a.amount); // most positive first

        const giver = givers[0];
        const receiver = receivers[0];

        const amount = Math.min(-giver.amount, receiver.amount);

        settlements.push({
            from: { name: giver.name, mail: giver.mail },
            to: { name: receiver.name, mail: receiver.mail },
            amount: parseFloat(amount.toFixed(2))
        });

        giver.amount += amount;
        receiver.amount -= amount;

        if (Math.abs(giver.amount) < 0.1) givers.shift(); // remove near-zero
        if (Math.abs(receiver.amount) < 0.1) receivers.shift(); // remove near-zero
    }

    
    return { settlements, userSpendings };
}