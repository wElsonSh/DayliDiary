// variables
const headerInputBtn = document.getElementById("header_input_btn")
    , headerInputBtnText = document.getElementById("header_input_btn_text")
    , headerInput = document.getElementById("header_input")
    , days_list = document.getElementById("days_list")
    , blur = document.getElementById("blur")
let DATE = null
    , request = indexedDB.open("diary", 2)
    , db
    , daysArr = []

//DB
request.onupgradeneeded = function (event) {
    db = event.target.result
    if (!db.objectStoreNames.contains("days")) {
        db.createObjectStore("days", { keyPath: "id", autoIncrement: true })
    }
}
request.onerror = function () {
    console.log("Error: " + request.error)
}
request.onsuccess = function (event) {
    db = event.target.result
    console.log(db);

    headerInputBtn.addEventListener("click", () => {
        if (headerInputValCheck()) {
            daysDATAall(headerInput.value)
            lastcompletedDayDateDATASave()
            handleDayCompletedBtnStyle()
            window.location.reload()
        } else {
            headerInput.value = ""
        }
    })
    headerInput.addEventListener("keydown", (event) => {
        if (event.key === 'Enter') {
            if (headerInputValCheck()) {
                daysDATAall(headerInput.value)
                lastcompletedDayDateDATASave()
                handleDayCompletedBtnStyle()
                headerInput.blur()
                window.location.reload()

            } else {
                headerInput.value = ""
                headerInput.blur()
            }
        }
    })
    getAllDaysDATA(function (days) {
        daysArr = [...days]
        console.log(daysArr);
        showAllDays()
    });
}

// functions

function daysDATAall(value) {
    let newDate = new Date()
    addDayDATA({ content: `${value}`, date: newDate.getDate() < 10 ? "0" + newDate.getDate() : newDate.getDate(), month: newDate.getMonth() + 1 < 10 ? "0" + (newDate.getMonth() + 1) : newDate.getMonth() + 1, year: newDate.getFullYear(), hour: newDate.getHours() < 10 ? "0" + newDate.getHours() : newDate.getHours(), minets: newDate.getMinutes() < 10 ? "10" + newDate.getMinutes() : newDate.getMinutes() })
    getAllDaysDATA(function (days) {
        daysArr = [...days]
        console.log(daysArr);
    });
    showAllDays()

}
function addDayDATA(dayDATA) {

    if (!db) {
        console.log("БД не инициализированна!");
        return
    }

    const transaction = db.transaction(["days"], "readwrite")
        , store = transaction.objectStore("days")
        , request = store.add(dayDATA)
    request.onerror = function () {
        console.log("Не удалось добавить данные: " + request.error)
    }
    request.onsuccess = function () {
        console.log("Данные успешно добавлены!")
    }
    transaction.onerror = function () {
        console.log("Ошибка транзации: " + transaction.error);
    }
    transaction.oncomplete = function () {
        console.log("Транзакция успешно выполнена!");

    }
    return request
}

function getAllDaysDATA(callback) {
    if (!db) {
        console.log("БД не инициализированна!");
        if (callback) callback(null)
        return
    }

    const transaction = db.transaction(["days"], "readonly")
        , store = transaction.objectStore("days")
        , request = store.getAll()
    console.log(request);

    request.onerror = function () {
        console.log("Не удалось получить данные: " + request.error)
        if (callback) callback(null)
    }
    request.onsuccess = function () {
        console.log("Данные успешно получены!")
        if (callback) callback(request.result)
    }
}

function showAllDays() {
    Object.entries(daysArr).forEach(([key, value]) => {
        let li = document.createElement("li")
            , span = document.createElement("span")
            , p = document.createElement("p")
        let textaDate = daysArr[key].date + '.' + daysArr[key].month + '.' + daysArr[key].year + ' ' + daysArr[key].hour + ':' + daysArr[key].minets
        li.className = 'days_list_item'
        span.className = 'days_list_item_header'
        p.innerHTML = textaDate
        span.appendChild(p)
        li.appendChild(span)
        days_list.appendChild(li)

        let p2 = document.createElement("p")
        p2.textContent = daysArr[key].content
        li.appendChild(p2)

    })

}
function handleDayCompletedBtnStyle() {
    headerInputBtnText.textContent = "The day is complete"
    headerInputBtn.classList.add("header_input_btn__complete")
    headerInput.value = ""
    headerInput.placeholder = "this day is complete, se you tomorrow..."
}
function headerInputValCheck() {
    if (headerInput.value.trim()) {
        return true
    } else {
        return false
    }
}
function lastcompletedDayDateDATASave() {
    DATE = new Date()
    let completedDayDATA = DATE.getDate()
    localStorage.setItem("lastCompletedDayDate", JSON.stringify(completedDayDATA))
}


// evet listeners
headerInput.addEventListener("focus", () => {
    if (headerInputBtn.classList.contains("header_input_btn__complete")) {
        headerInput.disabled = true
    }
})

setTimeout(() => {
    blur.classList.add("no_visible")
}, 3000)

document.addEventListener('DOMContentLoaded', () => {
    DATE = new Date()
    let lastCompletedDayDate = JSON.parse(localStorage.getItem("lastCompletedDayDate"))
    if (lastCompletedDayDate) {
        if (DATE.getDate() === lastCompletedDayDate) {
            handleDayCompletedBtnStyle()
        } else {
            localStorage.clear()
            return
        }
    }
});
