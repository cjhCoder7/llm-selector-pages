// 定义可用的LLM模型
const models = [
    { name: "StarCoder", image: "images/StarCoder.png" },
    { name: "CodeGeeX", image: "images/CodeGeeX.png" },
    { name: "Yi-Coder", image: "images/Yi-Coder.svg" },
    { name: "CodeGemma", image: "images/CodeGemma.webp" },
    { name: "Codestral", image: "images/Codestral.webp" },
    { name: "OpenCoder", image: "images/OpenCoder.png" },
    { name: "CodeQwen", image: "images/CodeQwen.png" },
    { name: "Qwen-Coder", image: "images/qwen-coder.png" },
    { name: "DeepSeek-Coder", image: "images/deepseek-coder.png" },
    { name: "Code-Llama", image: "images/code-llama.png" }
];

// 渐变色配置
const gradientPairs = {
    light: [
        ['#007AFF', '#5856D6'], // Blue to Purple
        ['#5856D6', '#FF2D55'], // Purple to Pink
        ['#FF2D55', '#FF9500'], // Pink to Orange
        ['#FF9500', '#FFCC00'], // Orange to Yellow
        ['#34C759', '#007AFF'], // Green to Blue
        ['#AF52DE', '#5856D6'], // Purple to Indigo
        ['#FF3B30', '#FF2D55'], // Red to Pink
        ['#5AC8FA', '#007AFF'], // Light Blue to Blue
        ['#FFCC00', '#FF9500'], // Yellow to Orange
        ['#4CD964', '#34C759']  // Light Green to Green
    ],
    dark: [
        ['#0A84FF', '#5E5CE6'], // Blue to Purple
        ['#5E5CE6', '#FF375F'], // Purple to Pink
        ['#FF375F', '#FF9F0A'], // Pink to Orange
        ['#FF9F0A', '#FFD60A'], // Orange to Yellow
        ['#30D158', '#0A84FF'], // Green to Blue
        ['#BF5AF2', '#5E5CE6'], // Purple to Indigo
        ['#FF453A', '#FF375F'], // Red to Pink
        ['#64D2FF', '#0A84FF'], // Light Blue to Blue
        ['#FFD60A', '#FF9F0A'], // Yellow to Orange
        ['#32D74B', '#30D158']  // Light Green to Green
    ]
};

// 初始化 Markdown-it
const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true
});

// 加载外部Markdown文档
async function loadMarkdownDoc() {
    try {
        const response = await fetch('document.md');
        const text = await response.text();
        document.getElementById("markdown-content").innerHTML = md.render(text);
    } catch (err) {
        console.error('Error loading markdown:', err);
        const basicInstructions = `
# Quick Start Guide
1. Enter your coding question in the input field
2. Click 'Submit' to get model recommendations
3. The pie chart will show the probability distribution
4. Scroll down to see detailed model information
        `;
        document.getElementById("markdown-content").innerHTML = md.render(basicInstructions);
    }
}

// 检测系统颜色模式
function isDarkMode() {
    return document.documentElement.dataset.theme === 'dark';
}

// 创建渐变色
function createGradients(ctx) {
    const colorScheme = isDarkMode() ? 'dark' : 'light';
    return gradientPairs[colorScheme].map((colors, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        return gradient;
    });
}

// 初始化扇形图
function initializeChart() {
    const ctx = document.getElementById("pie-chart").getContext("2d");
    const gradients = createGradients(ctx);

    const chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: models.map(model => model.name),
            datasets: [{
                data: new Array(models.length).fill(0),
                backgroundColor: gradients,
                borderWidth: 2,
                borderColor: isDarkMode() ? '#2d2d2f' : '#ffffff',
                borderRadius: 5,
                spacing: 3,
                hoverOffset: 15
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        color: isDarkMode() ? '#ffffff' : '#1d1d1f',
                        font: {
                            size: 14,
                            weight: '600',
                            family: '-apple-system, BlinkMacSystemFont, "SF Pro Text"'
                        },
                        generateLabels: function (chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percentage = value ? Math.round(value * 100) : 0;
                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: isDarkMode() ? '#ffffff' : '#1d1d1f',
                                        lineWidth: 2,
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: isDarkMode() ? 'rgba(45, 45, 47, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDarkMode() ? '#f5f5f7' : '#1d1d1f',
                    bodyColor: isDarkMode() ? '#f5f5f7' : '#1d1d1f',
                    borderColor: isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const percentage = Math.round(value * 100);
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            elements: {
                arc: {
                    borderWidth: 2
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'xy'
            }
        },
    });

    return chart;
}

// 渲染模型卡片
function renderModelCards() {
    const container = document.getElementById("models-container");
    models.forEach((model, index) => {
        const card = document.createElement("div");
        card.className = "col";
        card.innerHTML = `
            <div class="card h-100 model-card" data-model-index="${index}">
                <div class="card-img-wrapper">
                    <img src="${model.image}" class="card-img-top" alt="${model.name}" 
                         loading="lazy" draggable="false">
                </div>
                <div class="card-body">
                    <h5 class="card-title">${model.name}</h5>
                    <div class="probability-badge" style="display: none;">
                        <span class="badge">0%</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 更新图表和卡片显示
function updateVisualization(probabilities) {
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const rotation = -90 - (360 * (maxIndex / probabilities.length));

    // 创建动画过渡
    const currentRotation = pieChart.options.rotation || 0;

    // 使用GSAP创建平滑的动画
    gsap.to(pieChart.options, {
        rotation: rotation,
        duration: 1.5,
        ease: "elastic.out(1, 0.75)",
        onUpdate: () => {
            pieChart.update('none');
        },
        onComplete: () => {
            pieChart.data.datasets[0].data = probabilities;
            pieChart.update();
        }
    });

    // 更新卡片和推荐信息
    const bestModelInfo = document.querySelector('.best-model-info');
    bestModelInfo.style.display = 'block';

    probabilities.forEach((prob, index) => {
        const card = document.querySelector(`[data-model-index="${index}"]`);
        const badge = card.querySelector('.probability-badge');
        const percentage = Math.round(prob * 100);

        gsap.to(badge.querySelector('.badge'), {
            innerHTML: `${percentage}%`,
            duration: 1,
            snap: { innerHTML: 1 },
            ease: "power2.out"
        });

        badge.style.display = 'block';

        if (index === maxIndex) {
            // 更新推荐文本
            document.getElementById('best-model-text').innerHTML =
                `Based on your question, <strong>${models[index].name}</strong> is recommended with ${percentage}% confidence.`;

            // 添加高亮效果
            card.classList.add('highlight');

            // 使用GSAP添加注意力动画
            gsap.fromTo(bestModelInfo,
                { opacity: 0, y: -10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out"
                }
            );
        } else {
            card.classList.remove('highlight');
        }
    });
}

// 添加彩带效果
function triggerConfetti() {
    const submitBtn = document.getElementById("submit-btn");
    const rect = submitBtn.getBoundingClientRect();
    const buttonCenter = {
        x: (rect.left + rect.right) / 2 / window.innerWidth,
        y: (rect.top + rect.bottom) / 2 / window.innerHeight
    };

    const count = 100;
    const defaults = {
        origin: buttonCenter,
        zIndex: 9999,
        gravity: 2,
        disableForReducedMotion: true
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            scalar: 0.8,
            spread: 45,
            drift: 0,
            ticks: 200
        });
    }

    fire(0.25, {
        spread: 15,
        startVelocity: 25,
        decay: 0.92,
        scalar: 0.6
    });

    fire(0.2, {
        spread: 30,
        decay: 0.91,
        scalar: 0.6
    });

    fire(0.35, {
        spread: 45,
        decay: 0.92,
        scalar: 0.7
    });

    fire(0.1, {
        spread: 60,
        startVelocity: 15,
        decay: 0.92,
        scalar: 0.7
    });

    fire(0.1, {
        spread: 60,
        startVelocity: 25,
        decay: 0.91,
        scalar: 0.8
    });
}

// 提交按钮逻辑
async function handleSubmit() {
    const question = document.getElementById("question-input").value.trim();
    if (!question) {
        gsap.to(".input-group", {
            x: [-10, 10, -10, 10, 0],
            duration: 0.4,
            ease: "power2.out"
        });
        return;
    }

    const submitBtn = document.getElementById("submit-btn");
    const spinner = document.getElementById("loading-spinner");

    gsap.to(submitBtn, {
        scale: 0.95,
        duration: 0.2,
        ease: "power2.out"
    });

    submitBtn.disabled = true;
    spinner.style.display = "inline-block";

    try {
        const response = await fetch("/api/answer", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await response.json();
        updateVisualization(data.probabilities);
        triggerConfetti(); // 添加彩带效果
    } catch (err) {
        console.error("Error:", err);
        const mockProbabilities = models.map(() => Math.random());
        const sum = mockProbabilities.reduce((a, b) => a + b, 0);
        const normalizedProbabilities = mockProbabilities.map(p => (p / sum));
        updateVisualization(normalizedProbabilities);
        triggerConfetti(); // 即使是模拟数据也添加彩带效果
    } finally {
        gsap.to(submitBtn, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
        });
        submitBtn.disabled = false;
        spinner.style.display = "none";
    }
}

// 添加进度条HTML
function addProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressContainer.appendChild(progressBar);
    document.body.prepend(progressContainer);
}

// 更新进度条
function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;

    // 防止除以零
    if (documentHeight <= 0) {
        if (progressBar) progressBar.style.width = '100%';
        return;
    }

    const progress = (scrolled / documentHeight) * 100;

    if (progressBar) {
        // 使用GSAP实现平滑动画
        gsap.to(progressBar, {
            width: `${Math.min(progress, 100)}%`,
            duration: 0.1,
            ease: "power2.out"
        });

        // 添加模糊效果
        if (progress > 0) {
            progressBar.style.opacity = '1';
        } else {
            progressBar.style.opacity = '0.6';
        }
    }
}

// 主题切换功能
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.dataset.theme = theme;
    document.getElementById('theme-toggle').classList.toggle('active', theme === 'dark');
    updateChartTheme(theme);
}

function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const isDark = themeToggle.classList.toggle('active');
    const newTheme = isDark ? 'dark' : 'light';

    // 更新文档主题
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);

    // 使用GSAP添加过渡动画
    gsap.to('body', {
        backgroundColor: isDark ? '#000000' : '#fbfbfd',
        duration: 0.25,
        ease: "power2.inOut"
    });

    // 更新图表主题
    updateChartTheme(newTheme);
}

function updateChartTheme(theme) {
    if (!pieChart) return;

    const isDark = theme === 'dark';
    const newGradients = createGradients(pieChart.ctx);

    pieChart.data.datasets[0].backgroundColor = newGradients;
    pieChart.data.datasets[0].borderColor = isDark ? '#2d2d2f' : '#ffffff';
    pieChart.options.plugins.legend.labels.color = isDark ? '#f5f5f7' : '#1d1d1f';
    pieChart.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(45, 45, 47, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    pieChart.options.plugins.tooltip.titleColor = isDark ? '#f5f5f7' : '#1d1d1f';
    pieChart.options.plugins.tooltip.bodyColor = isDark ? '#f5f5f7' : '#1d1d1f';
    pieChart.options.plugins.tooltip.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    pieChart.update();
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
    loadMarkdownDoc();
    renderModelCards();
    pieChart = initializeChart();
    addProgressBar();
    initTheme();

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.addEventListener("click", handleSubmit);

    const input = document.getElementById("question-input");
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSubmit();
    });

    input.addEventListener("focus", () => {
        gsap.to(".input-group", {
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    input.addEventListener("blur", () => {
        gsap.to(".input-group", {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    // 添加主题切换监听
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);

    // 添加滚动事件监听
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateProgressBar);
    }, { passive: true });

    // 监听文档高度变化
    const resizeObserver = new ResizeObserver(() => {
        updateProgressBar();
    });
    resizeObserver.observe(document.body);

    // 初始化进度条
    updateProgressBar();
});
