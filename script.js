
function setProgress(currentScreen, screens) {
    progress.value = (currentScreen / (screens + 1)) * 100;
}

function setBoard(data) {
    destination.innerHTML = "";
    origin.innerHTML = "";
    let target = document.querySelector(".target p");
    target.innerHTML = data.sentence;

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
            new Audio("media/flip.mp3").play();
        });

        button.addEventListener("click", function (e) {

            let num = document.querySelectorAll(".destination .word").length;
            console.log(num);
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

let score = 10;
const destination = document.querySelector(".destination");
const origin = document.querySelector(".origin");
const words = origin.querySelectorAll(".word");

const checkBtn = document.querySelector(".check");
const continueBtn = document.querySelector(".continue");
const againBtn = document.querySelector(".again");
const results = document.querySelector(".results");

checkBtn.addEventListener("click", function () {
    continueBtn.style.display = "block";
    checkBtn.style.display = "none";


    document.querySelectorAll(".words button").forEach(function (btn) {
        btn.setAttribute("disabled", true);
        btn.style.cursor = "auto";
        checkBtn.style.background = "#5f91c98a";
    });

    if (false) {

        new Audio("media/correct.wav").play();
        destination.insertAdjacentHTML('beforeEnd', '<i class="fa fa-solid fa-check"></i>');


    } else {
        score -= 2;
        new Audio("media/wrong.wav").play();
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
        againBtn.style.display = "block";
        results.style.display = "block";
        checkBtn.style.display = "none";
        document.querySelector(".words").style.display = "none";
        // new Audio("media/applause.wav").play();
        new Audio("media/fail.mp3").play();
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