const crypto = require('crypto');
const fs = require('fs');

function hashCalculator(algo = 'md5', filePath) {
	return new Promise((resolve, reject) => {
		var shasum = crypto.createHash(algo);
		var stream = fs.createReadStream(filePath);
		stream.on('data', (d) => {
			shasum.update(d);
		});
		stream.on('end', () => {
			let checksumCalculated = shasum.digest('hex');
			resolve(checksumCalculated);
		});
		stream.on('error', (error) => {
			reject(error);
		});
	});
}

module.exports = { hashCalculator };
