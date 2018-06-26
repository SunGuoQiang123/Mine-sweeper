
function MineMap(width, height, bombSize) {
    this.width = width * 20
    this.bombList = [];
    this.itemList = this.generateBombCord(width, height, bombSize);
}

 MineMap.prototype.generateBombCord = function(width, height, size) {
        const fullArr = [];
        let resArr = [];

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                fullArr.push(i + '_' + j);
            }
        }

        while (resArr.length < size) {
            const index = Math.floor(Math.random() * fullArr.length);
            if (!resArr.includes(fullArr[index])) {
                resArr.push(fullArr[index]);
            }
        }

        return fullArr.reduce((prev, cur) => {
            if (resArr.includes(cur)) {
                const bombIns = new Block(this, cur, 'bomb');
                prev.push(bombIns);
                this.bombList.push(bombIns);
            } else {
                const arr = generateRelationBLk(cur);
                const count = arr.reduce(function(total,item){
                    if (resArr.includes(item)) {
                        total += 1;
                    }
                    return total;
                },0);
                prev.push(new Block(this, cur, 'normal', count));
            }
            return prev;
        }, []);
}

 MineMap.prototype.render = function() {
    const container = document.getElementById('container');
    const oldWrap = container.getElementsByTagName('div')[0];
    if (oldWrap) {
        container.removeChild(oldWrap);
    }
    container.style.width = this.width + 'px';
    const fragment = document.createDocumentFragment();
    const wrap = document.createElement('div');
    wrap.className = 'blockWrap';
    this.itemList.forEach(function(item) {
        wrap.appendChild(item.render());
    });
    fragment.appendChild(wrap);
    container.appendChild(fragment);
}

class Block {
    constructor(parent, cord, type, count) {
        this.parent = parent;
        this.cord = cord;
        this.type = type;
        this.nearBomb = count;
        this.status = 'untouched';
        setTimeout(() => {this.ele = document.querySelector("[data-cord='" + this.cord + "']")});
    }

    render() {
        const blk = document.createElement('div');
        blk.dataset.cord = this.cord;
        blk.className = 'untouched';
        blk.addEventListener('click', e => {
            this.confirmBlock.call(this, e);
        });
        return blk;
    }

    confirmBlock(e) {
        if (this.type === 'bomb') {
            // alert('game over');
            this.parent.bombList.forEach(bomb => {
                bomb.showBomb();
            })
        } else {
            if (this.nearBomb > 0) {
                // alert('nearby bomb size is' + this.nearBomb);
                this.ele.textContent = this.nearBomb;
            } else {
                alert('no bomb here');
            }
        }
    }

    showBomb() {
        if (this.type === 'bomb') {
            this.ele.textContent = 'b';
        }
    }
}

    const modeMap = {
        simple: [30, 20, 500],
        medium: [50, 40, 20],
        hard: [80, 65, 30]
    };
    const menu = document.getElementById('menu');
    menu.addEventListener('click',e => {
        const option = modeMap[e.target.dataset.mode];
        const map = new MineMap(...option);
        map.render();
    });

function generateRelationBLk(cord) {
    const arr = cord.split('_').map(function(it){return parseInt(it)});
    const tmpArr = [[arr[0]-1, arr[1]+1], [arr[0], arr[1]+1], [arr[0]+1, arr[1]+1], [arr[0]-1, arr[1]], [arr[0]+1, arr[1]], [arr[0]-1, arr[1]-1], [arr[0], arr[1]-1], [arr[0]+1, arr[1]-1]];
    return tmpArr.reduce(function(prev,cur){
        prev.push(cur.join('_'));
        return prev;
    }, [])
}
