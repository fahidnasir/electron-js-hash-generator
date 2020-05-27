const { clipboard, ipcRenderer, remote } = require('electron');

const dialog = remote.dialog;

const inpFileName = document.querySelector('#fileName');
const inpFilePath = document.querySelector('#filePath');
const inpChecksum = document.querySelector('#checksum');
const inpFileSize = document.querySelector('#fileSize');
let currentFileSize = 0;
const inpfileSizeType = document.querySelector('#fileSizeType');
const inpchecksumType = document.querySelector('#checksumType');

/************* Section Hash Calculator ***************/
document.getElementById('btnOpenFile').addEventListener('click', async (ev) => {
	ev.preventDefault();

	const files = await dialog.showOpenDialog({
		properties: ['openFile', 'createDirectory'],
	});
	if (files.canceled) return;
	let filePath = files.filePaths[0];

	inpfileSizeType.disabled = false;

	inpFilePath.setAttribute('value', filePath);
	inpFileName.setAttribute('value', filePath.replace(/^.*[\\\/]/, ''));

	const { checksumCalculated, fileSizeInBytes } = await getHash(
		'md5',
		filePath
	);

	checkSumUpdate(checksumCalculated, fileSizeInBytes);
});

/**
 * Drag and Hash calculate events
 */
document.ondragover = document.ondrop = (ev) => {
	ev.preventDefault();
};

document.body.ondrop = async (ev) => {
	inpFileName.setAttribute('value', ev.dataTransfer.files[0].name);
	inpFilePath.setAttribute('value', ev.dataTransfer.files[0].path);

	const { checksumCalculated, fileSizeInBytes } = await getHash(
		'md5',
		ev.dataTransfer.files[0].path
	);

	checkSumUpdate(checksumCalculated, fileSizeInBytes);

	inpfileSizeType.disabled = false;
	ev.preventDefault();
};

/************* Section End Hash Calculator ***************/

/************* Section Element Events ***************/
document.querySelector('#btnGenerate').addEventListener('click', async () => {
	if (inpFilePath.value) {
		const { checksumCalculated, fileSizeInBytes } = await getHash(
			'md5',
			inpFilePath.value
		);
		checkSumUpdate(checksumCalculated, fileSizeInBytes);
	}
});

document.querySelector('#btnVerify').addEventListener('click', async () => {
	if (inpFilePath.value && inpChecksum.value) {
		const isEqual = await validateHash(
			'md5',
			inpFilePath.value,
			inpChecksum.value
		);
		checksumValidated(isEqual);
	}
});

inpfileSizeType.addEventListener('change', () => {
	const sizeType = inpfileSizeType.value;
	inpFileSize.setAttribute('value', currentFileSize / sizeType);
});

inpchecksumType.addEventListener('change', () => {});

// Registering all the copy buttons
const copyButtons = document.querySelectorAll('.btnCopy');
for (var i = 0; i < copyButtons.length; i++) {
	copyButtons[i].addEventListener('click', function (event) {
		clipboard.writeText(event.path[1].children[1].value);
	});
}

/************* End Section Element Events ***************/

/************* Section UI Helper function ***************/
function checkSumUpdate(checksumValue, fileSize) {
	inpChecksum.setAttribute('value', checksumValue);
	currentFileSize = fileSize;
	inpFileSize.setAttribute('value', fileSize);
}

async function checksumValidated(isMatch) {
	console.log('Verifying');
	if (isMatch) {
		console.log('Validated');
		await dialog.showMessageBox({
			type: 'info',
			title: 'Checksum Verification Result',
			message: 'Checksum Matched.',
		});
	} else {
		console.log('Not Validated');
		await dialog.showMessageBox({
			type: 'info',
			title: 'Checksum Verification Result',
			message: 'Checksum does not match.',
		});
	}
}
/************* End Section UI Helper function ***************/

/************* Section IPC Handler Events ***************/
async function getHash(algo, filePath) {
	const data = await ipcRenderer.invoke('calculateHash', algo, filePath);

	return data;
}

async function validateHash(algo, filePath, hashValue) {
	const isEqual = await ipcRenderer.invoke(
		'validateHash',
		algo,
		filePath,
		hashValue
	);
	return isEqual;
}
/************* End Section IPC Handler Events ***************/
