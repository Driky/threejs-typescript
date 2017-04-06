import Game from './game';
if(!Modernizr.webgl){
    console.log('WebGL not detected');
}else{
    if (!Modernizr.webglextensions) {
        console.log('webglextensions not detected');
    }else{
        for(var extension in Modernizr.webglextensions){
            console.log(extension);
        }
        
        new Game();
    }
}