window.addEventListener("DOMContentLoaded", () => {
  var step1 = document.querySelector("#step1");
  var step2 = document.querySelector("#step2");
  var nextButton = document.querySelector(".navigationFooter > button");
  console.log(step1, step2)
  nextButton.addEventListener("click", () => {
    if(step1.style.display == '') {
      step1.style.setProperty("display", "none");
      step2.style.removeProperty("display");
      nextButton.innerText = "Install";
    }
  })
});
