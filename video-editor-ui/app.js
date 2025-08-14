const importBtn = document.getElementById('import-btn');
const fileInput = document.getElementById('file-input');
const dropzone = document.getElementById('dropzone');
const previewVideo = document.getElementById('preview-video');
const playOverlay = document.getElementById('play-overlay');
const mainGrid = document.getElementById('main-grid');

function selectFiles() {
	fileInput.click();
}

function handleFiles(files) {
	if (!files || files.length === 0) return;
	const first = files[0];
	if (first.type.startsWith('video/')) {
		previewVideo.src = URL.createObjectURL(first);
		previewVideo.style.display = 'block';
		playOverlay.style.display = 'grid';
		document.querySelector('.stage-center-msg').style.display = 'none';
	}
}

importBtn.addEventListener('click', selectFiles);
fileInput.addEventListener('change', e => handleFiles(e.target.files));

;['dragenter','dragover'].forEach(type => {
	dropzone.addEventListener(type, e => {
		e.preventDefault();
		e.stopPropagation();
		dropzone.classList.add('dragover');
	});
});
;['dragleave','drop'].forEach(type => {
	dropzone.addEventListener(type, e => {
		e.preventDefault();
		e.stopPropagation();
		dropzone.classList.remove('dragover');
	});
});

dropzone.addEventListener('drop', e => {
	const dt = e.dataTransfer;
	if (dt && dt.files) handleFiles(dt.files);
});

playOverlay.addEventListener('click', () => {
	if (previewVideo.paused) {
		previewVideo.play();
		playOverlay.style.display = 'none';
	} else {
		previewVideo.pause();
		playOverlay.style.display = 'grid';
	}
});

previewVideo.addEventListener('play', () => playOverlay.style.display = 'none');
previewVideo.addEventListener('pause', () => playOverlay.style.display = 'grid');

// Resizable panels
let isResizing = false;
let resizeType = null; // 'left' | 'right' | 'bottom'
let startX = 0;
let startY = 0;
let startCols;
let startRows;

function getGridTemplateColumns() {
	return window.getComputedStyle(mainGrid).gridTemplateColumns.split(' ').map(x => x.trim());
}

function setGridTemplateColumns(cols) {
	mainGrid.style.gridTemplateColumns = cols.join(' ');
}

function getGridTemplateRows() {
	return window.getComputedStyle(mainGrid).gridTemplateRows.split(' ').map(x => x.trim());
}

function setGridTemplateRows(rows) {
	mainGrid.style.gridTemplateRows = rows.join(' ');
}

function onMouseDownResizer(e) {
	isResizing = true;
	resizeType = e.currentTarget.dataset.resize;
	startX = e.clientX;
	startY = e.clientY;
	startCols = getGridTemplateColumns();
	startRows = getGridTemplateRows();
	document.body.style.cursor = resizeType === 'bottom' ? 'row-resize' : 'col-resize';
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

function onMouseMove(e) {
	if (!isResizing) return;
	if (resizeType === 'left') {
		// adjust first column width
		const delta = e.clientX - startX; // positive -> wider left sidebar
		const current = parseInt(startCols[0]);
		const newWidth = clamp(current + delta, 220, 520);
		const cols = [...startCols];
		cols[0] = `${newWidth}px`;
		setGridTemplateColumns(cols);
	} else if (resizeType === 'right') {
		// adjust right sidebar width
		const delta = startX - e.clientX; // moving left increases right sidebar
		const current = parseInt(startCols[4]);
		const newWidth = clamp(current + delta, 220, 520);
		const cols = [...startCols];
		cols[4] = `${newWidth}px`;
		setGridTemplateColumns(cols);
	} else if (resizeType === 'bottom') {
		// adjust timeline height
		const delta = startY - e.clientY; // moving up increases timeline
		const current = parseInt(startRows[2]);
		const newHeight = clamp(current + delta, 160, 520);
		const rows = [...startRows];
		rows[2] = `${newHeight}px`;
		setGridTemplateRows(rows);
	}
}

function onMouseUp() {
	isResizing = false;
	document.body.style.cursor = '';
	document.removeEventListener('mousemove', onMouseMove);
	document.removeEventListener('mouseup', onMouseUp);
}

document.querySelectorAll('.resizer').forEach(el => {
	el.addEventListener('mousedown', onMouseDownResizer);
});