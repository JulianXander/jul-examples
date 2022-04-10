function isEvenlyDivisible(dividend: number, divisor: number): boolean {
	return dividend % divisor === 0;
}

for (let index = 1; index <= 100; index++) {
	let message;
	if (isEvenlyDivisible(index, 15)) {
		message = 'FizzBuzz';
	}
	else if (isEvenlyDivisible(index, 5)) {
		message = 'Buzz';
	}
	else if (isEvenlyDivisible(index, 3)) {
		message = 'Fizz';
	}
	else {
		message = index;
	}
	console.log(message);
}