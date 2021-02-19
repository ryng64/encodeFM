export function errorMessage(msg) {
  //target the portion of the screen to pop up alert
  const message = document.getElementById("errorMessage");
  const template = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>JSON Syntax Error </strong> ${msg || ""}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    `;
  message.innerHTML = template;
}

export function clearErrorMessage() {
  const message = document.getElementById("errorMessage");
  message.innerHTML = ``;
}
