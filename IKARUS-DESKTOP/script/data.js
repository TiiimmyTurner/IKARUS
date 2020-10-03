document.querySelectorAll("#data .value, #data .merged").forEach((element) => { element.addEventListener("click", () => {

    document.getElementById("value_side").setAttribute("style", "transform: rotateY(180deg);");
    document.getElementById("diagram").setAttribute("style", "transform: rotateY(360deg);");

    
    var wrappers = document.querySelectorAll("#data .values.auxiliary > *");
    for (var element of wrappers){
        if (element == wrappers[0]){
            element.setAttribute("style", "border-radius: 8px 8px 0px 0px; height: 20%; transition-delay: 0s;");
        }
        else if (element == wrappers[wrappers.length - 1]){
            element.setAttribute("style", "border-radius: 0px 0px 8px 8px; height: 20%; transition-delay: 0s;");
        }
        else {
            element.setAttribute("style", "border-radius: 0px; height: 20%; transition-delay: 0s;");
        }
    }

    });

});
document.querySelector("#diagram").addEventListener("click", () => {
    document.getElementById("value_side").setAttribute("style", "transform: rotateY(0deg);");
    document.getElementById("diagram").setAttribute("style", "transform: rotateY(180deg);");
    document.querySelectorAll("#data .values.auxiliary > *").forEach((element) => {
        element.setAttribute("style", "border-radius: 8px; height: 17%; transition-delay: 0.5s;");
    });
});