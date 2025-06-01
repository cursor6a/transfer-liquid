let svgNS = "http://www.w3.org/2000/svg";
let containers = [];
let moveCount = 0;
let filled = 0;
let isWin = false;
let selectedContainerIndex = null;
let outlinePath = "m804.646 1021.439h-544.18c-39.986 0-70.809-19.063-89.139-55.13-13.167-25.908-14.989-51.656-15.06-52.74l-0.033-0.507 0.001-0.508c0.016-7.06 1.522-706.575 0.005-762.64-0.562-20.75-4.051-34.423-10.091-39.543-4.725-4.004-13.354-4.323-24.145-4.323-24.939 0-39.907 1.452-40.056 1.467l-15.584 1.542-0.878-15.635c-0.939-16.887 5.224-32.363 17.824-44.753 9.176-9.023 21.863-16.579 37.707-22.456 25.508-9.462 51.038-11.573 52.112-11.658l1.154-0.047c3.173-0.007 319.799-0.679 537.468-0.679 129.897 0 197.419 0.229 206.424 0.699 16.07 0.84 22.815 8.243 25.643 14.306 7.615 16.325-6.283 34.771-20.998 54.301-1.918 2.547-3.826 5.078-5.643 7.555-12.809 17.463-15.238 35.155-15.555 37.991V911.83c0 49.277-26.333 76.565-48.424 90.78-23.223 14.943-46.48 18.522-47.459 18.667l-1.093 0.162z m-618.41-109.408c0.583 6.936 8.28 79.408 74.229 79.408h541.809c8.868-1.638 69.349-15.184 69.349-79.609V127.482l0.033-0.499c0.075-1.121 2.052-27.751 21.33-54.036 1.892-2.579 3.877-5.214 5.874-7.865 4.127-5.478 10.809-14.347 14.493-20.696-12.766-0.274-60.165-0.558-201.602-0.558-212.735 0-520.02 0.642-536.716 0.677-5.653 0.58-60.512 6.893-75.739 31.942 6.279-0.229 13.9-0.399 22.707-0.399 12.681 0 30.048 0 43.542 11.438 13.277 11.254 19.85 30.833 20.683 61.617 1.521 56.165 0.087 726.583 0.008 762.928z";
let liquidPath = "m807.3793,980.31573l-558.20696,0c-58.40885,1.07213 -55.3142,-66.48561 -55.3142,-66.48561l0,-514.75112l669.00692,0l0,521.65363c0.00108,0 -0.31508,56.81598 -55.48577,59.5831z";

const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFE000',
    '#FF00FF', '#00FFD9', '#FFA500', '#8000FF', '#91C522'];

function setupGame() {
    filled = parseInt(document.getElementById('filledContainers').value);
    const empty = parseInt(document.getElementById('emptyContainers').value);
    const initialState = document.getElementById('initialState').value.split(' ');
    const gameArea = document.getElementById('gameArea');
    
    // 初始化容器
    for (let i = 0; i < filled + empty; i++) {
        const container = document.createElement('div');
        container.className = 'container';
        container.dataset.index = i;

        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute('viewBox', '0 0 1000 1200');
        const outline = document.createElementNS(svgNS, "path");
        outline.setAttribute('d', outlinePath);
        svg.appendChild(outline);
        container.appendChild(svg);
        
        if (i < filled) {
            outline.setAttribute('fill', colors[i]);
            const liquid = document.createElementNS(svgNS, "path");
            liquid.setAttribute('d', liquidPath);
            // 根据初始状态设置颜色
            const colorIndex = parseInt(initialState[i]) - 1;
            liquid.setAttribute('fill', colors[colorIndex]);
            liquid.setAttribute('fill-opacity', '0.6');
            svg.appendChild(liquid);
        }
        container.onclick = () => selectContainer(i);
        gameArea.appendChild(container);
        containers.push(container);
    }
    
    moveCount = 0;
    updateMoveCount();
}

function selectContainer(index) {
    const container = containers[index];
    const svg = container.querySelector('svg');
    const liquid = svg.querySelectorAll('path')[1];
    
    if (selectedContainerIndex === null) {
        // 选择第一个容器
        if (liquid) {
            selectedContainerIndex = index;
            container.classList.add('selected');
        }
    } else {
        // 选择第二个容器
        if (!liquid) {
            // 转移液体
            const sourceContainer = containers[selectedContainerIndex];
            const sourceSVG = sourceContainer.querySelector('svg');
            const sourceLiquid = sourceSVG.querySelectorAll('path')[1];
            
            // 添加液体到目标容器
            const newLiquid = document.createElementNS(svgNS, "path");
            newLiquid.setAttribute('d', liquidPath);
            newLiquid.setAttribute('fill', sourceLiquid.getAttribute('fill'));
            svg.appendChild(newLiquid);

            // 移除源容器的液体
            sourceSVG.removeChild(sourceLiquid);
            
            // 重置选择状态
            containers[selectedContainerIndex].classList.remove('selected');
            
            // 更新移动次数
            moveCount++;
            updateMoveCount();
        } else {
            // 如果选择的是有液体的容器，则取消原选择，保留目前选择
            containers[selectedContainerIndex].classList.remove('selected');
            selectedContainerIndex = index;
            container.classList.add('selected');
        }
    }
    checkWinCondition();
}

function updateMoveCount() {
    document.getElementById('moveCount').textContent = moveCount;
}

function startGame() {
    setupGame();
    closeSettings();
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function generateRandomState() {
    const filled = parseInt(document.getElementById('filledContainers').value);
    const numbers = Array.from({length: filled}, (_, i) => i + 1);
    
    // Fisher-Yates shuffle算法
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    document.getElementById('initialState').value = numbers.join(' ');
}

// 初始化时添加input事件监听
const initialStateInput = document.getElementById('initialState');
const startButton = document.querySelector('.controls > button');


function validateInitialState() {
    const filled = parseInt(document.getElementById('filledContainers').value);
    const empty = parseInt(document.getElementById('emptyContainers').value);
    const input = initialStateInput.value.trim();
    const numbers = input.split(' ');

    // 验证是否为可能的打乱后状态
    const isValid = filled >= 3 && filled <= 9 && empty >= 1 && empty <= 9 && input.length > 0 &&
        numbers.length === filled &&
        numbers.sort().every((element, index) => element - 1 === index);

    // 更新按钮状态
    startButton.disabled = !isValid;
    startButton.style.backgroundColor = isValid ? '#4CAF50' : '#CCC';
}


let filledInput = document.getElementById('filledContainers');
let emptyInput = document.getElementById('emptyContainers');

filledInput.addEventListener('blur', (e) => {
    if (e.target.value > 9)
        e.target.value = 9;
    else if (e.target.value < 3)
        e.target.value = 3;
})

emptyInput.addEventListener('blur', (e) => {
    if (e.target.value > 9)
        e.target.value = 9;
    else if (e.target.value < 1)
        e.target.value = 1;
})

initialStateInput.addEventListener('change', validateInitialState);
filledInput.addEventListener('change', validateInitialState);
emptyInput.addEventListener('change', validateInitialState);
document.getElementById('randomButton').addEventListener('click', validateInitialState);

function checkWinCondition() {
    if (isWin) return;
    // 获取所有有液体的容器
    const filledContainers = containers.slice(0, filled);

    // 检查每个容器的液体颜色是否与默认颜色组顺序一致
    if (filledContainers.every((container, index) => {
        const liquid = container.querySelectorAll('path')[1];
        if (liquid) {
            return liquid.getAttribute('fill') === colors[index];
        }
        return false;
    })) {
        showWinMessage();
        isWin = true;
    }
}

function showWinMessage() {
    // 创建胜利提示框
    const winModal = document.createElement('div');
    winModal.className = 'win-modal';
    
    const winContent = document.createElement('div');
    winContent.className = 'win-content';
    
    const winText = document.createElement('h2');
    winText.textContent = '🎉 恭喜通关！ 🎉';
    
    const moveCountText = document.createElement('p');
    moveCountText.textContent = `总转移次数：${moveCount}`;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.onclick = () => document.body.removeChild(winModal);
    
    winContent.appendChild(winText);
    winContent.appendChild(moveCountText);
    winContent.appendChild(closeButton);
    winModal.appendChild(winContent);
    document.body.appendChild(winModal);
}
