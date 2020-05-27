const fs = require('fs');

function fileSize(filePath) {
	const stats = fs.statSync(filePath);
	const fileSizeInBytes = stats.size;
	return fileSizeInBytes;
}

module.exports = { fileSize };
