var inpFileName = document.querySelector('#fileName');
var inpFilePath = document.querySelector('#filePath');
var inpChecksum = document.querySelector('#checksum');

document.ondragover = document.ondrop = ev => {
  ev.preventDefault();
};

const { ipcRenderer } = require('electron');

document.body.ondrop = ev => {
  console.log(ev.dataTransfer.files[0].path);
  inpFileName.setAttribute('value', ev.dataTransfer.files[0].name);
  inpFilePath.setAttribute('value', ev.dataTransfer.files[0].path);

  ipcRenderer.send('onFileDrag', ev.dataTransfer.files[0].path);
  ipcRenderer.on('checksumCalculated', (event, arg) => {
    console.log(arg);
		inpChecksum.setAttribute('value', arg);
  });
  ev.preventDefault();
};
