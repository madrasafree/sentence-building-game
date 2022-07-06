
function setProgress(currentScreen, screens) {
    progress.value = (currentScreen / (screens + 1)) * 100;
}

function setBoard(data) {
    destination.innerHTML = "";
    origin.innerHTML = "";
    let target = document.querySelector(".target p");
    target.innerHTML = data.sentence;

    correctOrder = data.words.filter(word => word.order >= 0).map(word => word.order);

    shuffle(data.words).forEach(function (item) {
        let block = document.createElement("div");
        let button = document.createElement("button");
        button.innerHTML = item.value;

        block.classList.add("word-container");
        button.classList.add("word");
        button.dataset.order = item.order;

        block.appendChild(button);
        origin.appendChild(block);

        button.addEventListener("click", function (e) {
            if (isAnimating) return;
            this.closest(".word-container") ? move(this) : putback(this);
            if (allowSound) new Audio("media/flip.mp3").play();
        });

        button.addEventListener("click", function (e) {

            let num = document.querySelectorAll(".destination .word").length;


            if (num > 0) {
                checkBtn.removeAttribute("disabled");
                checkBtn.style.background = "#5f91c9";
                checkBtn.style.cursor = "pointer";
            } else {
                checkBtn.setAttribute("disabled", true);
                checkBtn.style.background = "#5f91c98a";
                checkBtn.style.cursor = "auto";
            }
        });
    });
}

function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

let correctOrder;
let totalSeconds = 0;
let timer;
let score = 10;
let allowSound = true;
if (localStorage.getItem('allowSound')) {
    allowSound = JSON.parse(localStorage.getItem('allowSound'));
}

if (!allowSound) {
    document.querySelector(".toggle-sound").classList.remove("fa-volume-high");
    document.querySelector(".toggle-sound").classList.add("fa-volume-xmark");

} else {
    document.querySelector(".toggle-sound").classList.add("fa-volume-high");
    document.querySelector(".toggle-sound").classList.remove("fa-volume-xmark");
}


document.querySelector("#start_game-btn").addEventListener("click", function () {
    timer = setInterval(setTime, 1000);
    document.querySelector("#popup_container").style.display = "none";
});

const destination = document.querySelector(".destination");
const origin = document.querySelector(".origin");
const words = origin.querySelectorAll(".word");

const checkBtn = document.querySelector(".check");
const continueBtn = document.querySelector(".continue");
const againBtn = document.querySelector(".again");
const results = document.querySelector(".results");

const minutesLabel = document.getElementById("timer");
const secondsLabel = document.getElementById("seconds");

document.querySelector(".restart-btn").onclick = () => location.reload();

document.querySelector(".toggle-sound").onclick = function () {

    if (this.classList.contains("fa-volume-high")) {
        this.classList.remove("fa-volume-high");
        this.classList.add("fa-volume-xmark");
        allowSound = false;

    } else {
        this.classList.add("fa-volume-high");
        this.classList.remove("fa-volume-xmark");
        allowSound = true;
    }
    localStorage.setItem('allowSound', allowSound);
};

checkBtn.addEventListener("click", function () {
    continueBtn.style.display = "block";
    checkBtn.style.display = "none";
    let answers = []

    document.querySelectorAll(".destination .word").forEach(function (word) {
        answers.push(Number(word.dataset.order));
    });


    document.querySelectorAll(".words button").forEach(function (btn) {
        btn.setAttribute("disabled", true);
        btn.style.cursor = "auto";
        checkBtn.style.background = "#5f91c98a";
    });

    if (arraysEqual(answers, correctOrder)) {
        if (allowSound) new Audio("media/correct.wav").play();
        destination.insertAdjacentHTML('beforeEnd', '<i class="fa fa-solid fa-check"></i>');


    } else {
        score -= 2;
        if (allowSound) new Audio("media/wrong.wav").play();
        destination.insertAdjacentHTML('beforeEnd', '<i class="fa fa-solid fa-xmark"></i>');
    }
});

continueBtn.addEventListener("click", function () {


    checkBtn.setAttribute("disabled", true);
    checkBtn.style.cursor = "auto";


    document.querySelectorAll(".words button").forEach(function (btn) {
        btn.removeAttribute("disabled", true);
        btn.style.cursor = "pointer";
    });

    continueBtn.style.display = "none";
    checkBtn.style.display = "block";
    if (currentScreen == screens) {
        clearInterval(timer);
        checkBtn.style.display = "none";
        document.querySelector(".words").style.display = "none";
        document.querySelector(".score").innerHTML = `${score}/10`;

        if (score >= 5) {
            document.querySelector(".result-msg").innerHTML = " כֻּלّ אִלְאִחְתִרַאם! כל הכבוד!";
            document.querySelector(".result-image .win").style.display = "block";
            document.querySelector(".result-image .lose").style.display = "none";
            if (allowSound) new Audio("media/applause.wav").play();
            document.querySelector(".score").style.color = "green";
        } else {
            document.querySelector(".result-msg").innerHTML = " בַּסִיטַה! לא הצלחתם הפעם. נסו שוב!";
            document.querySelector(".result-image .win").style.display = "none";
            document.querySelector(".result-image .lose").style.display = "block";
            if (allowSound) new Audio("media/fail.mp3").play();
            document.querySelector(".score").style.color = "red";
        }

        againBtn.style.display = "block";
        results.style.display = "block";

    }
    currentScreen++;
    setProgress(currentScreen, screens);
    setBoard(data[currentScreen - 1]);
});


againBtn.addEventListener("click", function () {
    location.reload();
});

const progress = document.querySelector("progress");
let currentScreen = 1;
let screens = data.length;

setBoard(data[currentScreen - 1]);
setProgress(currentScreen, screens);

let isAnimating = false;

const flip = (word, settings) => {
    const invert = {
        x: settings.first.left - settings.last.left,
        y: settings.first.top - settings.last.top,
    };

    let animation = word.animate(
        [
            { transform: `scale(1,1) translate(${invert.x}px, ${invert.y}px)` },
            { transform: `scale(1,1) translate(0, 0)` },
        ],
        {
            duration: 300,
            easing: "ease",
        }
    );

    animation.onfinish = () => (isAnimating = false);
};

const move = (word) => {
    const id = Math.random();
    const container = word.closest(".word-container");
    let rect = word.getBoundingClientRect();
    let first, last;

    isAnimating = true;

    container.dataset.id = id;
    word.dataset.id = id;

    container.style.height = `${word.offsetHeight}px`;
    container.style.width = `${word.offsetWidth}px`;

    first = { top: rect.top, left: rect.left };
    destination.insertAdjacentElement("beforeend", word);
    rect = word.getBoundingClientRect();
    last = { top: rect.top, left: rect.left };

    flip(word, { first, last });
};

const putback = (word) => {
    const id = word.dataset.id;
    const container = origin.querySelector(`[data-id="${id}"]`);
    const siblings = [...destination.querySelectorAll(".word")].filter(
        (sib) => sib !== word
    );

    let rect = word.getBoundingClientRect();
    let first, last;

    isAnimating = true;

    first = { top: rect.top, left: rect.left };
    siblings.forEach((sib) => {
        let rect = sib.getBoundingClientRect();
        sib.__first = { top: rect.top, left: rect.left };
    });

    container.insertAdjacentElement("beforeend", word);

    rect = word.getBoundingClientRect();
    last = { top: rect.top, left: rect.left };

    siblings.forEach((sib) => {
        let rect = sib.getBoundingClientRect();
        sib.__last = { top: rect.top, left: rect.left };
    });

    flip(word, { first, last });

    siblings.forEach((sib) =>
        flip(sib, { first: sib.__first, last: sib.__last })
    );

    container.style.height = "";
    container.style.width = "";
    container.removeAttribute("data-id");
    word.removeAttribute("data-id");
};