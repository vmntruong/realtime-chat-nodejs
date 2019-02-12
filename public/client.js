var scrolled = false;
function updateScroll(){
    if(!scrolled){
        var element = document.getElementById("message-box");
        element.scrollTop = element.scrollHeight;
    }
}

$("#message-box").on('scroll', function(){
    scrolled=true;
});