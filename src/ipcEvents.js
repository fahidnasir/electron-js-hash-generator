const { ipcMain } = require('electron');
const { hashCalculator } = require('./helpers/hashHelper');
const { fileSize } = require('./helpers/fileHelper');

ipcMain.handle('calculateHash', async (event, algo, filePath) => {
	const checksumCalculated = await hashCalculator(algo, filePath);
	const fileSizeInBytes = fileSize(filePath);

	return { checksumCalculated, fileSizeInBytes };
});

ipcMain.handle('validateHash', async (event, algo, filePath, checksumValue) => {
	const checksumCalculated = await hashCalculator(algo, filePath);
	const isEqual = checksumCalculated === checksumValue;

	return isEqual;
});
