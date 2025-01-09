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

    document.querySelector("#summary-button").classList.add("active");
    document.querySelector("#details-button").classList.remove("active");
    document.querySelector("#method-button").classList.remove("active");
}

function details() {
    document.querySelector("#summary").style.display = "none";
    document.querySelector("#details").style.display = "block";
    document.querySelector("#transaction-form").style.display = "none";
    document.querySelector("#method-form").style.display = "none";

    document.querySelector("#summary-button").classList.remove("active");
    document.querySelector("#details-button").classList.add("active");
    document.querySelector("#transaction-button").classList.remove("active");
    document.querySelector("#method-button").classList.remove("active");
}

function transaction() {
    document.querySelector("#summary").style.display = "none";
    document.querySelector("#details").style.display = "none";
    document.querySelector("#transaction-form").style.display = "block";
    document.querySelector("#method-form").style.display = "none";

    document.querySelector("#summary-button").classList.remove("active");
    document.querySelector("#details-button").classList.remove("active");
    document.querySelector("#transaction-button").classList.add("active");
    document.querySelector("#method-button").classList.remove("active");
}

function method() {
    document.querySelector("#summary").style.display = "none";
    document.querySelector("#details").style.display = "none";
    document.querySelector("#transaction-form").style.display = "none";
    document.querySelector("#method-form").style.display = "block";

    document.querySelector("#summary-button").classList.remove("active");
    document.querySelector("#details-button").classList.remove("active");
    document.querySelector("#transaction-button").classList.remove("active");
    document.querySelector("#method-button").classList.add("active");
}