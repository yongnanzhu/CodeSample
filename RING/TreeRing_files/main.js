fetchData();

var intervalId;
var counter=2;
var renderLinks=[];

function main() {
    initialize();
    updateNodes();
    updateChords();

    intervalId=setInterval(onInterval,1);
}


function onInterval() {
    if(contr.length==0) {
        clearInterval(intervalId);
    }
    else {
       // renderLinks=[];
//        for (var i=0; i < counter; i++) {
//            if (contr.length > 0) {
//                renderLinks.push(contr.pop());
//            }
//        }
//        counter=30;
//        //counter++;
//        updateLinks(renderLinks);
        updateLinks(contr);
    }
}