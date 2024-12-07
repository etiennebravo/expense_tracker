document.addEventListener("DOMContentLoaded", ()=> {
    document.querySelector("#summary-button").addEventListener("click", () => summary());
    document.querySelector("#details-button").addEventListener("click", () => details());
    document.querySelector("#transaction-button").addEventListener("click", () => transaction());
    document.querySelector("#method-button").addEventListener("click", () => method());

    summary();
});

function summary() {
    document.querySelector("#summary").style.display = "block";
    document.querySelector("#details").style.display = "none";
    document.querySelector("#transaction-form").style.display = "none";
    document.querySelector("#method-form").style.display = "none";
}

function details() {
    document.querySelector("#summary").style.display = "none";
    document.querySelector("#details").style.display = "block";
    document.querySelector("#transaction-form").style.display = "none";
    document.querySelector("#method-form").style.display = "none";
}

function transaction() {
    document.querySelector("#summary").style.display = "none";
    document.querySelector("#details").style.display = "none";
    document.querySelector("#transaction-form").style.display = "block";
    document.querySelector("#method-form").style.display = "none";
}

function method() {
    document.querySelector("#summary").style.display = "none";
    document.querySelector("#details").style.display = "none";
    document.querySelector("#transaction-form").style.display = "none";
    document.querySelector("#method-form").style.display = "block";
}