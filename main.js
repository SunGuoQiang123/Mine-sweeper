const MODE = {
    easy: [8, 12, 14],
    medium: [12, 18, 32],
    hard: [18, 24, 64]
};
const MARKMAP = ['', 'M', '?'];
const container = document.getElementById('container');
const menu = document.getElementById('menu');
const BombStatus = document.querySelector('.bomb-status');
const ClockStatus = document.querySelector('.clock-status');
let wrap = null  // 游戏种所有格子容器

// 取消浏览器默认右键弹出菜单
container.addEventListener('contextmenu', function(e){e.preventDefault();})
menu.addEventListener('click', handleSelectMode)

let blocks = [];    // 当前游戏所有的格子
let bombIndexes = [];   // 当前游戏所有的雷所在格子的索引
let rows = 0;
let columns = 0;
let bombCount = 0;
let currentMarkBomb = 0;  // 当前标记炸弹数量

init('easy');

function handleSelectMode(e) {
    const mode = e.target.dataset.mode;
    if (mode) {
        init(mode);
    }
}

function generateBombIndexes(arr, count) {
    let cloneArr = arr.slice();
    let bombIndexes = [];
    while (bombIndexes.length < count) {
        const index = Math.floor(Math.random() * cloneArr.length);
        bombIndexes.push(...cloneArr.splice(index, 1));
    }
    return bombIndexes;
}

function indexToPos(index) {
    const x = ~~(index / rows);
    const y = index % rows;
    return [x, y];
}

function posToIndex([x, y]) {
    return x * rows + y;
}

function filterInvalidCord([x, y]) {
    const yValid = y >= 0 && y < rows;
    const xValid = x >= 0 && x < columns;
    return yValid && xValid;
}

function getAroundBlocks(val) {
    const cord = indexToPos(val);
    const [x, y] = [...cord];
    const aroundCords = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
        [x - 1, y - 1], [x - 1, y + 1], [x + 1, y - 1], [x + 1, y + 1]
    ];
    const validAroundCords = aroundCords.filter(filterInvalidCord);
    const res = validAroundCords.map(posToIndex);
    return res;
}

function getBombCount(val) {
    const aroundBlocks = getAroundBlocks(val);
    let aroundBombNum = 0;
    for (let i = 0; i < aroundBlocks.length; i++) {
        if (bombIndexes.includes(aroundBlocks[i])) {
            aroundBombNum += 1;
        }
    }
    return aroundBombNum;
}

function generateBlocks(blocks) {
    return blocks.map(val => {
        if (bombIndexes.includes(val)) {
            return {
                isBomb: true,
                content: 'bomb',
                visible: false,
                markType: 0
            }
        } else {
            const aroundBombNum = getBombCount(val);
            return {
                isBomb: false,
                content: aroundBombNum,
                visible: false,
                markType: 0
            }
        }
    })
}

function endGame() {
    wrap.removeEventListener('click', handleClick);
    wrap.removeEventListener('contextmenu', handleMark);
    container.classList.add('endGame');
}

function render() {
    const oldWrap = container.getElementsByTagName('div')[0];
    if (oldWrap) {
        container.removeChild(oldWrap);
    }
    container.classList.remove('endGame');
    BombStatus.textContent = `${currentMarkBomb} / ${bombCount}`;
    const fragment = document.createDocumentFragment();
    wrap = document.createElement('div');
    wrap.addEventListener('click', handleClick);
    wrap.addEventListener('contextmenu', handleMark);
    wrap.style.width = columns * 30 + 'px';
    wrap.style.height = rows * 30 + 'px';

    wrap.className = 'blockWrap';
    blocks.forEach(function(item, index) {
        const blk = document.createElement('div');
        blk.textContent = item.visible ? item.content : '';
        blk.dataset.index = index;
        blk.className = 'block';
        wrap.appendChild(blk);
    });
    fragment.appendChild(wrap);
    container.appendChild(fragment);
}

function hasWin() {
    return blocks.every(blk => {
        return blk.isBomb || (!blk.isBomb && blk.visible);
    });
}

function handleClick(e) {
    const index = e.target.dataset.index;
    let blk = blocks[index];
    if (blk) {
        if (blk.visible || !!blk.markType) {
            return;
        }

        if (blk.isBomb) {
            bombIndexes.forEach(bomb => {
                renderBlock(bomb, 'bomb', index == bomb)
            })
            endGame();
            alert('you have clicked bomb!!!');
            return;
        }

        if (!!blk.content) {
            blk.visible = true;
            renderBlock(index, blk.content);
        } else {
            loopBlankBlock(index, blk);
        }

        if (hasWin()) {
            endGame();
            alert('game over you have won！！！！');
            return;
        }
    }
}

function handleMark(e) {
    e.preventDefault();
    const index = e.target.dataset.index;
    let blk = blocks[index];
    if (blk && !blk.visible) {
        currentMarkBomb += blk.markType === 1 ? (-1) : (blk.markType === 0 ? 1 : 0);
        blk.markType = blk.markType === 2 ? 0 : blk.markType + 1;
        renderMark(index, blk.markType);
    }
}

function renderMark(index, type) {
    const el = document.querySelector("[data-index='" + index + "']");
    if (type === 1) {
        el.classList.add('bombMark');
    } else if (type === 2) {
        el.classList.remove('bombMark');
        el.textContent = MARKMAP[2];
    } else if (type === 0) {
        el.textContent = '';
    }
    BombStatus.textContent = `${currentMarkBomb} / ${bombCount}`;
}

function renderBlock(index, content, clickedBomb = false) {
    const el = document.querySelector("[data-index='" + index + "']");
    if (blocks[index].markType) {
        el.textContent = '';
        el.classList.remove('bombMark');
    }
    if (content === 'bomb') {
        el.classList.add('bgBomb');
        if (clickedBomb) {
            el.classList.add('bgRed');
        }
    } else {
        el.textContent = content === 0 ? '' : content;
    }
    el.classList.add('visible');
}

function loopBlankBlock(index, blk) {
    blk.visible = true;
    renderBlock(index, blk.content);
    const aroundBlocks = getAroundBlocks(index);
    const unMarkedBlocks = aroundBlocks.filter(val => !blocks[val].visible)
    for (let i = 0; i < unMarkedBlocks.length; i++) {
        let aroundBlk = blocks[unMarkedBlocks[i]];
        if (!!aroundBlk.content) {
            aroundBlk.visible = true;
            renderBlock(unMarkedBlocks[i], aroundBlk.content);
        } else if (aroundBlk.content === 0) {
            loopBlankBlock(unMarkedBlocks[i], aroundBlk);
        }
    }
}

function init(mode) {
    [rows, columns, bombCount] = MODE[mode];
    currentMarkBomb = 0;
    let indexBlocks = Array.from({length: rows * columns}).map((val, index) => index);
    bombIndexes = generateBombIndexes(indexBlocks, bombCount);
    blocks = generateBlocks(indexBlocks);
    render();
}
