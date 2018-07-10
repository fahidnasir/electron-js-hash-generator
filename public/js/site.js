var inpFileName = document.querySelector('#fileName');
var inpFilePath = document.querySelector('#filePath');
var inpChecksum = document.querySelector('#checksum');
var inpFileSize = document.querySelector('#fileSize');

document.ondragover = document.ondrop = ev => {
  ev.preventDefault();
};

const { ipcRenderer, remote } = require('electron');
const dialog = remote.dialog;

document.body.ondrop = ev => {
  console.log(ev.dataTransfer.files[0].path);
  inpFileName.setAttribute('value', ev.dataTransfer.files[0].name);
  inpFilePath.setAttribute('value', ev.dataTransfer.files[0].path);

  ipcRenderer.send('calculateMD5', ev.dataTransfer.files[0].path);
  ev.preventDefault();
};

ipcRenderer.on('checksumCalculated', (event, checksumValue, fileSize) => {
  inpChecksum.setAttribute('value', checksumValue);
  inpFileSize.setAttribute('value', fileSize);
});

function onGenerate() {
  if (inpFilePath.value) {
    ipcRenderer.send('calculateMD5', inpFilePath.value);
  }
}

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
      message: 'Checksum is not correct.'
    });
  }
});

function onVerify() {
  console.log('onVerify');
  if (inpFilePath.value && inpChecksum.value) {
    ipcRenderer.send('validateMD5', inpFilePath.value, inpChecksum.value);
  }
}
