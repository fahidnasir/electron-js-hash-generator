const { clipboard, ipcRenderer, remote } = require('electron');
const dialog = remote.dialog;

const inpFileName = document.querySelector('#fileName');
const inpFilePath = document.querySelector('#filePath');
const inpChecksum = document.querySelector('#checksum');
const inpFileSize = document.querySelector('#fileSize');
let currentFileSize = 0;
const inpfileSizeType = document.querySelector('#fileSizeType');
const inpchecksumType = document.querySelector('#checksumType');

document.querySelector('#btnGenerate').addEventListener('click', () => {
  if (inpFilePath.value) {
    ipcRenderer.send('calculateHash', inpFilePath.value);
  }
});

document.querySelector('#btnVerify').addEventListener('click', () => {
  console.log('onVerify');
  if (inpFilePath.value && inpChecksum.value) {
    ipcRenderer.send('validateHash', inpFilePath.value, inpChecksum.value);
  }
});

inpfileSizeType.addEventListener('change', () => {
  const sizeType = inpfileSizeType.value;
  inpFileSize.setAttribute('value', currentFileSize / sizeType);
});

inpchecksumType.addEventListener('change', () => {});

const copyButtons = document.querySelectorAll('.btnCopy');
for (var i = 0; i < copyButtons.length; i++) {
  copyButtons[i].addEventListener('click', function(event) {
    clipboard.writeText(event.path[1].children[1].value);
  });
}

/**
 * Drag and Hash calculate events
 */
document.ondragover = document.ondrop = ev => {
  ev.preventDefault();
};

document.body.ondrop = ev => {
  console.log(ev.dataTransfer.files[0].path);
  inpfileSizeType.disabled = false;

  inpFileName.setAttribute('value', ev.dataTransfer.files[0].name);
  inpFilePath.setAttribute('value', ev.dataTransfer.files[0].path);

  ipcRenderer.send('calculateHash', ev.dataTransfer.files[0].path);
  ev.preventDefault();
};

ipcRenderer.on('checksumCalculated', (event, checksumValue, fileSize) => {
  inpChecksum.setAttribute('value', checksumValue);
  currentFileSize = fileSize;
  inpFileSize.setAttribute('value', fileSize);
});

ipcRenderer.on('checksumValidated', (event, isMatch) => {
  console.log('Verifying');
  if (isMatch) {
    console.log('Validated');
    dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'info',
      title: 'Checksum Verification Result',
      message: 'Checksum Matched.'
    });
  } else {
    console.log('Not Validated');
    dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'info',
      title: 'Checksum Verification Result',
      message: 'Checksum does not match.'
    });
  }
});
