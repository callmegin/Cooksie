const reset = () => {
  chrome.runtime.reload();
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#reset").addEventListener("click", reset);
});
